from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class Input(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class CampaignInput(Input):
    title: str = Field(min_length=3, max_length=140)
    description: str = Field(default="", max_length=2000)
    deadline: date | None = None
    hours: int = Field(default=3, ge=1, le=40)


class CampaignPatch(Input):
    title: str | None = Field(default=None, min_length=3, max_length=140)
    description: str | None = Field(default=None, max_length=2000)
    deadline: date | None = None
    hours: int | None = Field(default=None, ge=1, le=40)

    @model_validator(mode="after")
    def not_null(self):
        for key in self.model_fields_set - {"deadline"}:
            if getattr(self, key) is None:
                raise ValueError(f"{key} may not be null")
        return self


class QuestInput(Input):
    title: str = Field(min_length=3, max_length=140)
    difficulty: Literal["small", "medium", "large"] = "medium"
    campaign_id: str | None = Field(default=None, min_length=1, max_length=36)


class QuestPatch(Input):
    title: str | None = Field(default=None, min_length=3, max_length=140)
    difficulty: Literal["small", "medium", "large"] | None = None
    campaign_id: str | None = Field(default=None, min_length=1, max_length=36)

    @model_validator(mode="after")
    def not_null(self):
        for key in self.model_fields_set - {"campaign_id"}:
            if getattr(self, key) is None:
                raise ValueError(f"{key} may not be null")
        return self


class BuildInput(Input):
    plot_id: Literal["plot-1"]
    building_type: Literal["garden", "workshop"]
