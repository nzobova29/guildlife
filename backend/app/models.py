from datetime import UTC, date, datetime
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


def new_id():
    return str(uuid4())


def now():
    return datetime.now(UTC)


class Guest(Base):
    __tablename__ = "guests"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )


class Wallet(Base):
    __tablename__ = "wallets"
    __table_args__ = (CheckConstraint("coins >= 0"), CheckConstraint("total_xp >= 0"))
    guest_id: Mapped[str] = mapped_column(ForeignKey("guests.id"), primary_key=True)
    coins: Mapped[int] = mapped_column(Integer, default=40)
    total_xp: Mapped[int] = mapped_column(Integer, default=0)


class Campaign(Base):
    __tablename__ = "campaigns"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    guest_id: Mapped[str] = mapped_column(ForeignKey("guests.id"), index=True)
    title: Mapped[str] = mapped_column(String(140))
    description: Mapped[str] = mapped_column(Text, default="")
    deadline: Mapped[date | None] = mapped_column(Date, nullable=True)
    hours: Mapped[int] = mapped_column(Integer, default=3)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)


class Milestone(Base):
    __tablename__ = "milestones"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    campaign_id: Mapped[str] = mapped_column(
        ForeignKey("campaigns.id", ondelete="CASCADE"), index=True
    )
    title: Mapped[str] = mapped_column(String(140))
    ordering: Mapped[int] = mapped_column(Integer)


class Quest(Base):
    __tablename__ = "quests"
    __table_args__ = (CheckConstraint("difficulty IN ('small', 'medium', 'large')"),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    guest_id: Mapped[str] = mapped_column(ForeignKey("guests.id"), index=True)
    campaign_id: Mapped[str | None] = mapped_column(
        ForeignKey("campaigns.id", ondelete="SET NULL"), nullable=True, index=True
    )
    milestone_id: Mapped[str | None] = mapped_column(
        ForeignKey("milestones.id", ondelete="SET NULL"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(140))
    description: Mapped[str] = mapped_column(Text, default="")
    estimated_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    difficulty: Mapped[str] = mapped_column(String(10), default="medium")
    done: Mapped[bool] = mapped_column(Boolean, default=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)


class LedgerEntry(Base):
    __tablename__ = "reward_ledger"
    __table_args__ = (UniqueConstraint("quest_id", "event_type"),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    guest_id: Mapped[str] = mapped_column(ForeignKey("guests.id"), index=True)
    quest_id: Mapped[str | None] = mapped_column(ForeignKey("quests.id"), nullable=True)
    event_type: Mapped[str] = mapped_column(String(40))
    xp_delta: Mapped[int] = mapped_column(Integer, default=0)
    coin_delta: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)


class CityBuilding(Base):
    __tablename__ = "city_buildings"
    __table_args__ = (
        UniqueConstraint("guest_id", "plot_id"),
        CheckConstraint("plot_id = 'plot-1'"),
        CheckConstraint("building_type IN ('garden', 'workshop')"),
    )
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    guest_id: Mapped[str] = mapped_column(ForeignKey("guests.id"), index=True)
    plot_id: Mapped[str] = mapped_column(String(30))
    building_type: Mapped[str] = mapped_column(String(30))
    built_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
