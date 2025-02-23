from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Table, Float, UniqueConstraint, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Rating(Base):
    __tablename__ = "ratings"
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Float, nullable=False)

    __table_args__ = (
        UniqueConstraint("post_id", "user_id", name="unique_post_user_rating"),
    )

    post = relationship("Post", back_populates="ratings")
    user = relationship("User", back_populates="ratings")

# Tabla intermedia para la relación muchos a muchos entre Posts y Tags
post_tags = Table(
    "post_tags",
    Base.metadata,
    Column("post_id", Integer, ForeignKey("posts.id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id"), primary_key=True),
)

class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint("username", name="uq_username"),
        UniqueConstraint("email", name="uq_email"),
    )

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    # Nuevo campo para la frase de recordatorio de clave
    password_reminder = Column(String(255), nullable=False)
    posts = relationship("Post", back_populates="author")
    ratings = relationship("Rating", back_populates="user", cascade="all, delete-orphan")
    created_at = Column(DateTime, default=datetime.utcnow)

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=True)

    author_id = Column(Integer, ForeignKey("users.id"))
    author = relationship("User", back_populates="posts")

    tags = relationship("Tag", secondary=post_tags, back_populates="posts")
    ratings = relationship("Rating", back_populates="post", cascade="all, delete-orphan")

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)

    posts = relationship("Post", secondary=post_tags, back_populates="tags")
