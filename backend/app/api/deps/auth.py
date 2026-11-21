
import uuid

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.core.security import decode_access_token

bearer_scheme = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:

    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise unauthorized

    token = credentials.credentials

    try:
        payload = decode_access_token(token)
        user_id = uuid.UUID(payload["sub"])
        token_version = payload.get("ver", 0)

        if not isinstance(token_version, int) or isinstance(token_version, bool):
            raise unauthorized

    except (jwt.InvalidTokenError, ValueError, KeyError, TypeError):
        raise unauthorized

    user = db.get(User, user_id)

    if user is None or not user.is_active:
        raise unauthorized

    # Reject tokens issued before the user's latest password change.
    if token_version != user.token_version:
        raise unauthorized

    return user