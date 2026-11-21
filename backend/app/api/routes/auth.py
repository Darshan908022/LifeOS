
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2 import id_token

from app.db.session import get_db
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    GoogleLogin,
    UserProfileUpdate,
    UserPreferencesUpdate,
    ChangePasswordRequest,
    UserResponse,
    TokenResponse,
)
from app.services.user_service import (
    create_user,
    get_user_by_email,
)
from app.core.security import (
    verify_password,
    hash_password,
    create_access_token,
)
from app.core.config import settings
from app.api.deps.auth import get_current_user
from app.models.user import User


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    user_data: UserRegister,
    db: Session = Depends(get_db),
):
    user = create_user(db, user_data)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered",
        )

    return user


# NORMAL LOGIN
@router.post("/login", response_model=TokenResponse)
def login(
    user_data: UserLogin,
    db: Session = Depends(get_db),
):
    user = get_user_by_email(db, user_data.email)

    if (
        not user
        or not user.hashed_password
        or not verify_password(
            user_data.password,
            user.hashed_password,
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )

    access_token = create_access_token(
        subject=str(user.id),
        token_version=user.token_version,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


# GOOGLE LOGIN
@router.post("/google", response_model=TokenResponse)
def google_login(
    google_data: GoogleLogin,
    db: Session = Depends(get_db),
):
    try:
        google_user = id_token.verify_oauth2_token(
            google_data.credential,
            GoogleRequest(),
            settings.GOOGLE_CLIENT_ID,
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Google credential",
        )

    google_sub = google_user.get("sub")
    email = google_user.get("email", "").lower()
    email_verified = google_user.get("email_verified", False)
    full_name = google_user.get("name") or email.split("@")[0]

    if not google_sub or not email or not email_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google account email could not be verified",
        )

    user = db.scalar(
        select(User).where(User.google_sub == google_sub)
    )

    if user is None:
        user = get_user_by_email(db, email)

        if user:
            if user.google_sub and user.google_sub != google_sub:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="This email is linked to another Google account",
                )

            user.google_sub = google_sub

        else:
            user = User(
                full_name=full_name[:100],
                email=email,
                hashed_password=None,
                google_sub=google_sub,
                is_active=True,
            )
            db.add(user)

        db.commit()
        db.refresh(user)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )

    access_token = create_access_token(
        subject=str(user.id),
        token_version=user.token_version,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


# GET CURRENT USER PROFILE
@router.get("/me", response_model=UserResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    return current_user


# UPDATE CURRENT USER PROFILE
@router.put("/me", response_model=UserResponse)
def update_my_profile(
    profile_data: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_user.full_name = profile_data.full_name.strip()
    current_user.profile_image = profile_data.profile_image

    db.commit()
    db.refresh(current_user)

    return current_user


# GET CURRENT USER PREFERENCES
@router.get("/preferences")
def get_my_preferences(
    current_user: User = Depends(get_current_user),
):
    return {
        "theme_preference": current_user.theme_preference,
        "notifications_enabled": current_user.notifications_enabled,
    }


# UPDATE CURRENT USER PREFERENCES
@router.put("/preferences")
def update_my_preferences(
    preferences: UserPreferencesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_user.theme_preference = preferences.theme_preference
    current_user.notifications_enabled = preferences.notifications_enabled

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Preferences updated successfully",
        "theme_preference": current_user.theme_preference,
        "notifications_enabled": current_user.notifications_enabled,
    }


# CHANGE CURRENT USER PASSWORD
@router.put("/change-password")
def change_my_password(
    password_data: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account does not have a password. Please use your Google account.",
        )

    if not verify_password(
        password_data.current_password,
        current_user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    current_user.hashed_password = hash_password(
        password_data.new_password
    )

    # Invalidate all previously issued access tokens.
    current_user.token_version += 1

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Password changed successfully. Please log in again."
    }
