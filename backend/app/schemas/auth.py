
import uuid
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, model_validator


class UserRegister(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class GoogleLogin(BaseModel):
    credential: str = Field(min_length=1)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserProfileUpdate(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    profile_image: str | None = None


class UserPreferencesUpdate(BaseModel):
    theme_preference: Literal["light", "dark", "system"] = "light"
    notifications_enabled: bool = True


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)
    confirm_password: str = Field(min_length=8, max_length=128)

    @model_validator(mode="after")
    def validate_new_passwords(self):
        if self.new_password != self.confirm_password:
            raise ValueError("New passwords do not match")

        if self.current_password == self.new_password:
            raise ValueError(
                "New password must be different from current password"
            )

        return self


class UserResponse(BaseModel):
    id: uuid.UUID
    full_name: str
    email: EmailStr
    profile_image: str | None = None
    theme_preference: Literal["light", "dark", "system"] = "light"
    notifications_enabled: bool = True

    model_config = {"from_attributes": True}
