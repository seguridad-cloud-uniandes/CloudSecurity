from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class TagResponse(TagBase):
    id: int

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    hashed_password: str

class UserResponse(UserBase):
    id: int

    class Config:
        orm_mode = True

class AuthorResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        orm_mode = True

class PostBase(BaseModel):
    title: str
    content: str
    is_published: bool = False  # Nuevo campo con valor por defecto

class PostResponse(BaseModel):
    id: int
    title: str
    content: str
    created_at: datetime
    updated_at: Optional[datetime]
    is_published: bool
    author: UserResponse  # Relación con el autor
    tags: List[TagResponse] = []  # Ahora incluye etiquetas en la respuesta

    class Config:
        from_attributes = True  # Ahora es 'from_attributes' en lugar de 'orm_mode'

class PostCreate(PostBase):
    author_id: int
    tag_ids: List[int] = []  # Agregamos una lista de IDs de etiquetas
