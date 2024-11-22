from fastapi import Request, HTTPException, Depends
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from database import get_db
from models import User
from utils.admin_utils import SECRET_KEY, ALGORITHM
from starlette.status import HTTP_401_UNAUTHORIZED


async def role_dependency(request: Request, db: Session = Depends(get_db)):
    # Extract token from Authorization header
    token = request.headers.get("Authorization")
    if token is None or not token.startswith("Bearer "):
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing or invalid",
        )

    token = token.split(" ")[1]  # Extract the actual token
    try:
        # Decode token to get the payload
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # print("Decoded Token", payload)
        role = payload.get("role")
        if role is None:
            raise HTTPException(
                status_code=HTTP_401_UNAUTHORIZED, detail="Token validation failed"
            )

    except JWTError:
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED, detail="Token decoding failed"
        )
    return role  # Return the user for further use
