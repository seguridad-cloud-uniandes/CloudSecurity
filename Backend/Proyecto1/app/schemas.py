from pydantic import BaseModel, Field, EmailStr, field_validator
from datetime import datetime
from typing import Optional, List
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ✅ User Schema with Safe Validations
class UserBase(BaseModel):
    username: str = Field(
        ..., 
        min_length=3, 
        max_length=50, 
        pattern=r"^[a-zA-Z0-9_]+$"
    )
    email: EmailStr
    # Nueva propiedad para la frase de recordatorio, obligatoria
    password_reminder: str = Field(..., min_length=5, max_length=255)

    @field_validator("email", mode="before")
    def normalize_email(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

    @field_validator("username", mode="before")
    def normalize_username(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)

    @field_validator("password")
    def validate_password(cls, value: str):
        # Verificar que contenga al menos una letra mayúscula
        if not any(c.isupper() for c in value):
            raise ValueError("Password must contain at least one uppercase letter")
        # Verificar que contenga al menos una letra minúscula
        if not any(c.islower() for c in value):
            raise ValueError("Password must contain at least one lowercase letter")
        # Verificar que contenga al menos un dígito
        if not any(c.isdigit() for c in value):
            raise ValueError("Password must contain at least one digit")
        # Verificar que no existan números consecutivos
        for i in range(len(value) - 1):
            if value[i].isdigit() and value[i + 1].isdigit():
                raise ValueError("Password must not contain consecutive digits")
        return value

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

# ✅ Resto de los esquemas permanecen sin cambios

class RatingBase(BaseModel):
    rating: float = Field(..., ge=0.5, le=5)  

class RatingCreate(RatingBase):
    post_id: int

class RatingResponse(BaseModel):
    new_average: float

class TagBase(BaseModel):
    name: str = Field(
        ..., 
        min_length=2, 
        max_length=50, 
        pattern=r"^[a-zA-Z0-9_ -]+$"
    )

class TagCreate(TagBase):
    pass

class TagResponse(TagBase):
    id: int

    class Config:
        from_attributes = True

class AuthorResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True

class PostBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=100)
    content: str = Field(..., min_length=10, max_length=5000)
    is_published: bool = False  

class PostResponse(PostBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    author: UserResponse  
    tags: List[TagResponse] = []  
    average_rating: Optional[float] = None  

    class Config:
        from_attributes = True  

class PostCreate(PostBase):
    author_id: int = Field(..., gt=0)
    tag_ids: List[int] = Field(default=[])

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
