from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Campaign, CityBuilding, Guest, LedgerEntry, Quest, Wallet, now

REWARDS = {"small": (25, 10), "medium": (50, 20), "large": (80, 30)}
CATALOG = [
    {"building_type": "garden", "title": "Сад", "cost": 60},
    {"building_type": "workshop", "title": "Мастерская", "cost": 100},
]


def wallet_json(wallet: Wallet):
    return {"coins": wallet.coins, "total_xp": wallet.total_xp, "level": 1 + wallet.total_xp // 500}


def quest_json(quest: Quest):
    return {
        key: getattr(quest, key)
        for key in (
            "id",
            "title",
            "difficulty",
            "done",
            "campaign_id",
            "milestone_id",
            "description",
            "estimated_minutes",
        )
    }


def campaign_json(campaign: Campaign):
    return {
        key: getattr(campaign, key) for key in ("id", "title", "description", "deadline", "hours")
    }


def owned(db: Session, model, resource_id: str, guest_id: str, lock=False):
    statement = select(model).where(model.id == resource_id, model.guest_id == guest_id)
    if lock:
        statement = statement.with_for_update()
    obj = db.scalar(statement)
    if obj is None:
        raise HTTPException(404, "Resource not found")
    return obj


def game_state(db: Session, guest: Guest):
    from .ai import ai_available

    return {
        "guest": {"id": guest.id},
        "wallet": wallet_json(db.get(Wallet, guest.id)),
        "campaigns": [
            campaign_json(c)
            for c in db.scalars(
                select(Campaign)
                .where(Campaign.guest_id == guest.id)
                .order_by(Campaign.created_at, Campaign.id)
            )
        ],
        "quests": [
            quest_json(q)
            for q in db.scalars(
                select(Quest).where(Quest.guest_id == guest.id).order_by(Quest.created_at, Quest.id)
            )
        ],
        "buildings": [
            {"plot_id": b.plot_id, "building_type": b.building_type}
            for b in db.scalars(select(CityBuilding).where(CityBuilding.guest_id == guest.id))
        ],
        "catalog": CATALOG,
        "ai_available": ai_available(),
    }


def seed_guest(db: Session, guest: Guest):
    db.add(guest)
    db.flush()
    db.add(Wallet(guest_id=guest.id, coins=40, total_xp=0))
    db.add(LedgerEntry(guest_id=guest.id, event_type="guest_started", coin_delta=40, xp_delta=0))
    campaign = Campaign(
        guest_id=guest.id,
        title="Мой первый шаг",
        description="Демонстрационная цель. Измените её под свои планы.",
        hours=3,
    )
    db.add(campaign)
    db.flush()
    db.add_all(
        [
            Quest(
                guest_id=guest.id,
                campaign_id=campaign.id,
                title="Выделить 30 минут на свою цель",
                difficulty="medium",
            ),
            Quest(
                guest_id=guest.id,
                campaign_id=campaign.id,
                title="Записать следующий маленький шаг",
                difficulty="small",
            ),
        ]
    )
    db.commit()


def complete_quest(db: Session, guest: Guest, quest_id: str):
    # Consistent lock order serializes all economic writes for this guest.
    wallet = db.scalar(select(Wallet).where(Wallet.guest_id == guest.id).with_for_update())
    quest = owned(db, Quest, quest_id, guest.id, lock=True)
    if not quest.done:
        xp, coins = REWARDS[quest.difficulty]
        quest.done, quest.completed_at = True, now()
        wallet.total_xp += xp
        wallet.coins += coins
        db.add(
            LedgerEntry(
                guest_id=guest.id,
                quest_id=quest.id,
                event_type="quest_completed",
                coin_delta=coins,
                xp_delta=xp,
            )
        )
    db.commit()
    return {"quest": quest_json(quest), "wallet": wallet_json(wallet)}


def build(db: Session, guest: Guest, plot_id: str, building_type: str):
    wallet = db.scalar(select(Wallet).where(Wallet.guest_id == guest.id).with_for_update())
    existing = db.scalar(
        select(CityBuilding).where(
            CityBuilding.guest_id == guest.id, CityBuilding.plot_id == plot_id
        )
    )
    if existing:
        raise HTTPException(409, "Plot already occupied")
    cost = next(item["cost"] for item in CATALOG if item["building_type"] == building_type)
    if wallet.coins < cost:
        raise HTTPException(409, "Not enough coins")
    wallet.coins -= cost
    db.add(CityBuilding(guest_id=guest.id, plot_id=plot_id, building_type=building_type))
    db.add(
        LedgerEntry(guest_id=guest.id, event_type="building_built", coin_delta=-cost, xp_delta=0)
    )
    db.commit()
    return game_state(db, guest)
