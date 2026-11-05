from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy import func, select, text

from app.main import app
from app.models import Guest, LedgerEntry, Wallet


def guest(client):
    response = client.post("/api/v1/guest-session")
    assert response.status_code == 200
    return response.json()


def quest(client, **overrides):
    response = client.post(
        "/api/v1/quests", json={"title": "Read a chapter", "difficulty": "medium", **overrides}
    )
    assert response.status_code == 201
    return response.json()


def test_session_is_private_persistent_and_opaque(client, db):
    state = guest(client)
    assert state["wallet"] == {"coins": 40, "total_xp": 0, "level": 1}
    assert state["quests"] and state["campaigns"]
    token = client.cookies.get("guildlife_session")
    assert token != state["guest"]["id"]
    assert token not in db.scalar(select(Guest.token_hash))
    assert client.get("/api/v1/game-state").json() == state
    assert guest(client)["guest"] == state["guest"]
    with TestClient(app) as other:
        other_state = guest(other)
        assert other_state["guest"] != state["guest"]
        assert {q["id"] for q in state["quests"]}.isdisjoint(q["id"] for q in other_state["quests"])


def test_cookie_expiry_requires_new_session(client, db):
    state = guest(client)
    record = db.get(Guest, state["guest"]["id"])
    record.expires_at = datetime.now(UTC) - timedelta(seconds=1)
    db.commit()
    assert client.get("/api/v1/game-state").status_code == 401
    assert client.post("/api/v1/quests", json={"title": "Old guest task"}).status_code == 401
    assert guest(client)["guest"] != state["guest"]


def test_campaign_quest_validation_ownership_and_edit(client):
    guest(client)
    assert client.post("/api/v1/campaigns", json={"title": "  ", "hours": 1}).status_code == 422
    assert (
        client.post("/api/v1/campaigns", json={"title": "A real goal", "hours": 41}).status_code
        == 422
    )
    campaign = client.post(
        "/api/v1/campaigns",
        json={
            "title": "A real goal",
            "description": "Details",
            "deadline": "2027-12-01",
            "hours": 3,
        },
    ).json()
    created = quest(client, campaign_id=campaign["id"])
    assert (
        client.patch(
            f"/api/v1/quests/{created['id']}", json={"title": "New task", "difficulty": "large"}
        ).json()["difficulty"]
        == "large"
    )
    assert client.patch(f"/api/v1/quests/{created['id']}", json={"title": None}).status_code == 422
    assert (
        client.post(
            "/api/v1/quests", json={"title": "Bad difficulty", "difficulty": "extreme"}
        ).status_code
        == 422
    )
    with TestClient(app) as other:
        guest(other)
        assert (
            other.patch(
                f"/api/v1/quests/{created['id']}", json={"title": "Hijacked task"}
            ).status_code
            == 404
        )
        assert other.post(f"/api/v1/quests/{created['id']}/complete").status_code == 404
        assert (
            other.post(
                "/api/v1/quests", json={"title": "Cross guest task", "campaign_id": campaign["id"]}
            ).status_code
            == 404
        )
        assert (
            other.patch(
                f"/api/v1/campaigns/{campaign['id']}", json={"title": "Hijacked goal"}
            ).status_code
            == 404
        )
        assert other.delete(f"/api/v1/campaigns/{campaign['id']}").status_code == 404
        assert other.delete(f"/api/v1/quests/{created['id']}").status_code == 404


def test_complete_is_idempotent_and_ledger_matches_wallet(client, db):
    state = guest(client)
    created = quest(client)
    url = f"/api/v1/quests/{created['id']}/complete"
    first = client.post(url)
    assert first.status_code == 200
    assert first.json()["wallet"] == {"coins": 60, "total_xp": 50, "level": 1}
    assert client.post(url).json() == first.json()
    assert (
        client.patch(f"/api/v1/quests/{created['id']}", json={"difficulty": "large"}).status_code
        == 409
    )
    assert client.delete(f"/api/v1/quests/{created['id']}").status_code == 409
    ledger = db.scalars(
        select(LedgerEntry).where(LedgerEntry.guest_id == state["guest"]["id"])
    ).all()
    assert sum(e.coin_delta for e in ledger) == 60
    assert sum(e.xp_delta for e in ledger) == 50
    assert len([e for e in ledger if e.event_type == "quest_completed"]) == 1


def parallel_posts(token, path, payload=None):
    def send(_):
        with TestClient(app) as concurrent_client:
            concurrent_client.cookies.set("guildlife_session", token)
            return concurrent_client.post(path, json=payload)

    with ThreadPoolExecutor(max_workers=8) as pool:
        return list(pool.map(send, range(8)))


def test_postgresql_concurrent_completion_pays_once(client, db):
    assert db.bind.dialect.name == "postgresql"
    state = guest(client)
    created = quest(client, difficulty="large")
    results = parallel_posts(
        client.cookies.get("guildlife_session"), f"/api/v1/quests/{created['id']}/complete"
    )
    assert [r.status_code for r in results] == [200] * 8
    wallet = db.get(Wallet, state["guest"]["id"])
    assert (wallet.coins, wallet.total_xp) == (70, 80)
    assert (
        db.scalar(
            select(func.count())
            .select_from(LedgerEntry)
            .where(LedgerEntry.quest_id == created["id"])
        )
        == 1
    )


def test_build_insufficient_invalid_and_concurrent_atomic(client, db):
    state = guest(client)
    payload = {"plot_id": "plot-1", "building_type": "garden"}
    assert client.post("/api/v1/buildings/build", json=payload).status_code == 409
    assert client.get("/api/v1/game-state").json()["wallet"]["coins"] == 40
    assert (
        client.post("/api/v1/buildings/build", json={**payload, "plot_id": "plot-2"}).status_code
        == 422
    )
    created = quest(client)
    client.post(f"/api/v1/quests/{created['id']}/complete")
    results = parallel_posts(
        client.cookies.get("guildlife_session"), "/api/v1/buildings/build", payload
    )
    assert sorted(r.status_code for r in results) == [200] + [409] * 7
    after = client.get("/api/v1/game-state").json()
    assert after["wallet"]["coins"] == 0
    assert after["buildings"] == [payload]
    ledger = db.scalars(
        select(LedgerEntry).where(LedgerEntry.guest_id == state["guest"]["id"])
    ).all()
    assert sum(e.coin_delta for e in ledger) == 0


def test_origin_cookie_and_ledger_immutable(client, db):
    assert (
        client.post("/api/v1/guest-session", headers={"origin": "https://evil.example"}).status_code
        == 403
    )
    response = client.post("/api/v1/guest-session", headers={"origin": "http://localhost:5173"})
    assert "httponly" in response.headers["set-cookie"].lower()
    assert "samesite=lax" in response.headers["set-cookie"].lower()
    import pytest
    from sqlalchemy.exc import DBAPIError

    with pytest.raises(DBAPIError):
        db.execute(text("UPDATE reward_ledger SET coin_delta = 999"))
        db.commit()
    db.rollback()
    with pytest.raises(DBAPIError):
        db.execute(text("DELETE FROM reward_ledger"))
        db.commit()
    db.rollback()


def test_campaign_delete_preserves_open_quest_and_guest_separation(client):
    guest(client)
    campaign = client.post(
        "/api/v1/campaigns", json={"title": "Delete this goal", "hours": 2}
    ).json()
    created = quest(client, campaign_id=campaign["id"])
    assert client.delete(f"/api/v1/campaigns/{campaign['id']}").status_code == 204
    current = client.get("/api/v1/quests").json()
    assert next(q for q in current if q["id"] == created["id"])["campaign_id"] is None
    assert client.delete(f"/api/v1/quests/{created['id']}").status_code == 204


def test_invalid_campaign_reference_is_rejected_without_partial_write(client):
    guest(client)
    before = client.get("/api/v1/quests").json()
    response = client.post(
        "/api/v1/quests", json={"title": "Invalid campaign reference", "campaign_id": ""}
    )
    assert response.status_code == 422
    response = client.patch(f"/api/v1/quests/{before[0]['id']}", json={"campaign_id": "   "})
    assert response.status_code == 422
    assert client.get("/api/v1/quests").json() == before


def test_failed_ledger_insert_rolls_back_reward(client, db):
    import pytest
    from sqlalchemy import event

    from app.models import Quest

    state = guest(client)
    created = quest(client)

    def reject_insert(mapper, connection, target):
        if target.event_type == "quest_completed":
            raise RuntimeError("Simulated ledger persistence failure")

    event.listen(LedgerEntry, "before_insert", reject_insert)
    try:
        with pytest.raises(RuntimeError, match="Simulated ledger"):
            client.post(f"/api/v1/quests/{created['id']}/complete")
    finally:
        event.remove(LedgerEntry, "before_insert", reject_insert)
    assert db.get(Quest, created["id"]).done is False
    wallet = db.get(Wallet, state["guest"]["id"])
    assert (wallet.coins, wallet.total_xp) == (40, 0)
    assert client.post(f"/api/v1/quests/{created['id']}/complete").json()["wallet"]["coins"] == 60
