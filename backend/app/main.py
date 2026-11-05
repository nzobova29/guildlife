import os
import secrets
from contextlib import asynccontextmanager
from datetime import UTC, datetime, timedelta

from fastapi import Depends, FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from .ai import recover_stale_jobs
from .ai import router as ai_router
from .db import SessionLocal, get_db
from .dependencies import COOKIE_NAME, get_guest, lookup_guest, token_digest
from .models import Campaign, Guest, Quest
from .schemas import BuildInput, CampaignInput, CampaignPatch, QuestInput, QuestPatch
from .services import (
    build,
    campaign_json,
    complete_quest,
    game_state,
    owned,
    quest_json,
    seed_guest,
)

ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080,http://127.0.0.1:8080",
    ).split(",")
    if origin.strip()
]
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"
SESSION_TTL_SECONDS = int(os.getenv("SESSION_TTL_SECONDS", "604800"))


@asynccontextmanager
async def lifespan(app):
    with SessionLocal() as db:
        recover_stale_jobs(db)
    yield


app = FastAPI(title="GuildLife API", version="0.2.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Content-Type"],
)


@app.middleware("http")
async def check_origin(request: Request, call_next):
    if request.method not in {"GET", "HEAD", "OPTIONS"}:
        origin = request.headers.get("origin")
        if (origin and origin not in ALLOWED_ORIGINS) or request.headers.get(
            "sec-fetch-site"
        ) == "cross-site":
            return JSONResponse(status_code=403, content={"detail": "Origin not allowed"})
    return await call_next(request)


@app.get("/api/v1/health")
def health(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok"}


@app.post("/api/v1/guest-session")
def guest_session(request: Request, response: Response, db: Session = Depends(get_db)):
    guest = lookup_guest(request, db)
    if guest is None:
        token = secrets.token_urlsafe(32)
        guest = Guest(
            token_hash=token_digest(token),
            expires_at=datetime.now(UTC) + timedelta(seconds=SESSION_TTL_SECONDS),
        )
        seed_guest(db, guest)
        response.set_cookie(
            COOKIE_NAME,
            token,
            httponly=True,
            secure=COOKIE_SECURE,
            samesite="lax",
            max_age=SESSION_TTL_SECONDS,
            path="/api/v1",
        )
    return game_state(db, guest)


@app.get("/api/v1/game-state")
def state(guest: Guest = Depends(get_guest), db: Session = Depends(get_db)):
    return game_state(db, guest)


@app.get("/api/v1/campaigns")
def campaigns(guest: Guest = Depends(get_guest), db: Session = Depends(get_db)):
    return [
        campaign_json(c)
        for c in db.scalars(
            select(Campaign)
            .where(Campaign.guest_id == guest.id)
            .order_by(Campaign.created_at, Campaign.id)
        )
    ]


@app.post("/api/v1/campaigns", status_code=201)
def create_campaign(
    data: CampaignInput, guest: Guest = Depends(get_guest), db: Session = Depends(get_db)
):
    campaign = Campaign(guest_id=guest.id, **data.model_dump())
    db.add(campaign)
    db.commit()
    return campaign_json(campaign)


@app.patch("/api/v1/campaigns/{campaign_id}")
def edit_campaign(
    campaign_id: str,
    data: CampaignPatch,
    guest: Guest = Depends(get_guest),
    db: Session = Depends(get_db),
):
    campaign = owned(db, Campaign, campaign_id, guest.id, lock=True)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(campaign, key, value)
    db.commit()
    return campaign_json(campaign)


@app.delete("/api/v1/campaigns/{campaign_id}", status_code=204)
def delete_campaign(
    campaign_id: str, guest: Guest = Depends(get_guest), db: Session = Depends(get_db)
):
    db.delete(owned(db, Campaign, campaign_id, guest.id, lock=True))
    db.commit()


@app.get("/api/v1/quests")
def quests(
    campaign_id: str | None = None, guest: Guest = Depends(get_guest), db: Session = Depends(get_db)
):
    query = select(Quest).where(Quest.guest_id == guest.id).order_by(Quest.created_at, Quest.id)
    if campaign_id:
        owned(db, Campaign, campaign_id, guest.id)
        query = query.where(Quest.campaign_id == campaign_id)
    return [quest_json(q) for q in db.scalars(query)]


@app.post("/api/v1/quests", status_code=201)
def create_quest(
    data: QuestInput, guest: Guest = Depends(get_guest), db: Session = Depends(get_db)
):
    if data.campaign_id:
        owned(db, Campaign, data.campaign_id, guest.id)
    quest = Quest(guest_id=guest.id, **data.model_dump())
    db.add(quest)
    db.commit()
    return quest_json(quest)


@app.patch("/api/v1/quests/{quest_id}")
def edit_quest(
    quest_id: str,
    data: QuestPatch,
    guest: Guest = Depends(get_guest),
    db: Session = Depends(get_db),
):
    quest = owned(db, Quest, quest_id, guest.id, lock=True)
    if quest.done:
        raise HTTPException(409, "Completed quest cannot be edited")
    if data.campaign_id:
        owned(db, Campaign, data.campaign_id, guest.id)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(quest, key, value)
    db.commit()
    return quest_json(quest)


@app.delete("/api/v1/quests/{quest_id}", status_code=204)
def delete_quest(quest_id: str, guest: Guest = Depends(get_guest), db: Session = Depends(get_db)):
    quest = owned(db, Quest, quest_id, guest.id, lock=True)
    if quest.done:
        raise HTTPException(409, "Completed quest cannot be deleted")
    db.delete(quest)
    db.commit()


@app.post("/api/v1/quests/{quest_id}/complete")
def complete(quest_id: str, guest: Guest = Depends(get_guest), db: Session = Depends(get_db)):
    return complete_quest(db, guest, quest_id)


@app.post("/api/v1/buildings/build")
def construct(data: BuildInput, guest: Guest = Depends(get_guest), db: Session = Depends(get_db)):
    return build(db, guest, **data.model_dump())


app.include_router(ai_router, prefix="/api/v1")
