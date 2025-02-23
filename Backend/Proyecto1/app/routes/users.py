from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserResponse
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()

# Listar todos los usuarios
@router.get("/users", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

# Obtener un usuario por ID
@router.get("/users/{id}", response_model=UserResponse)
def get_user(id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Actualizar un usuario por ID
@router.put("/users/{id}", response_model=UserResponse)
def update_user(id: int, user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    # Como el esquema ya normaliza username y email, estos valores vienen en minúsculas
    db_user.username = user.username
    db_user.email = user.email
    # Re-hashear la contraseña antes de actualizarla
    db_user.hashed_password = pwd_context.hash(user.password)
    db.commit()
    db.refresh(db_user)
    return db_user

# Eliminar un usuario por ID
@router.delete("/users/{id}")
def delete_user(id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

# Crear un nuevo usuario
@router.post("/users", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(
        (User.email == user.email) | (User.username == user.username)
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=400, 
            detail="Email or username already registered"
        )

    hashed_password = pwd_context.hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        password_reminder=user.password_reminder  # Guardamos la frase de recordatorio
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user
