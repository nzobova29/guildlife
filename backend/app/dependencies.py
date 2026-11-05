import hashlib
from datetime import UTC, datetime

from fastapi import Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from .db import get_db
from .models import Guest

COOKIE_NAME = "guildlife_session"


def token_digest(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def lookup_guest(request: Request, db: Session):
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        return None
    return db.scalar(
        select(Guest).where(
            Guest.token_hash == token_digest(token), Guest.expires_at > datetime.now(UTC)
        )
    )


def get_guest(request: Request, db: Session = Depends(get_db)) -> Guest:
    guest = lookup_guest(request, db)
    if guest is None:
        raise HTTPException(status_code=401, detail="Guest session expired or missing")
    return guest
