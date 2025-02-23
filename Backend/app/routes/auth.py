from fastapi import APIRouter, Depends, HTTPException, Body, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app.database import get_db
from app.models import User
from app.auth import verify_password, create_access_token
from app.schemas import TokenResponse
from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
import os

# Secret key (debe guardarse en variables de entorno en producción)
SECRET_KEY = "security_blog_secret_key"
ALGORITHM = "HS256"
RESET_TOKEN_EXPIRE_MINUTES = 15  # Expiración del token de reseteo en 15 minutos

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()

# Endpoint de Login (se asume que se loguea por username; si deseas usar email, ajusta la consulta)
@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Se normaliza el username a minúsculas (si tu esquema ya lo hace, asegúrate de enviar el valor correcto)
    username = form_data.username.lower()
    user = db.query(User).filter(User.username == username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token({"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer", "user_id": user.id}

# Función para crear token de reseteo de contraseña
def create_reset_token(email: str):
    expire = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": email, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

# Función para verificar token de reseteo
def verify_reset_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=400, detail="Invalid token")
        return email
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

# Endpoint para solicitar reseteo de contraseña
@router.post("/request-password-reset")
def request_password_reset(data: dict = Body(...), db: Session = Depends(get_db)):
    email = data.get("email", "").lower()
    reminder = data.get("password_reminder", "")
    if not email or not reminder:
        raise HTTPException(status_code=400, detail="Email and password_reminder are required")
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.password_reminder != reminder:
        raise HTTPException(status_code=400, detail="Invalid secret phrase")
    
    reset_token = create_reset_token(user.email)
    # En un caso real se enviaría este token vía email. Aquí se devuelve para pruebas.
    return {"reset_token": reset_token, "message": "Use this token to reset your password"}

# Endpoint para resetear la contraseña
@router.post("/reset-password")
def reset_password(token: str = Body(...), new_password: str = Body(...), db: Session = Depends(get_db)):
    email = verify_reset_token(token)
    user = db.query(User).filter(User.email == email.lower()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.hashed_password = pwd_context.hash(new_password)
    db.commit()
    return {"message": "Password has been reset successfully"}
