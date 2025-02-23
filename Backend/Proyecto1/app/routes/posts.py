from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.sql import func
from fastapi.encoders import jsonable_encoder
from typing import List

from app.database import get_db
from app.models import Post, Tag, Rating
from app.schemas import PostCreate, PostResponse
from app.auth import get_current_user

router = APIRouter()


# ✅ Publish and Unpublish a Post (Protected)
@router.patch("/posts/{id}/publish", response_model=PostResponse)
def toggle_publish_post(
    id: int, publish: bool, db: Session = Depends(get_db), user=Depends(get_current_user)
):
    post = db.query(Post).filter(Post.id == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # ✅ Ensure only the author can publish/unpublish
    if post.author_id != user.id:  # 🔹 FIXED
        raise HTTPException(status_code=403, detail="Not authorized to modify this post")

    post.is_published = publish
    db.commit()
    db.refresh(post)
    return post


from typing import Optional
from app.models import User  # Asegúrate de tener importado el modelo de usuario si lo usas

@router.get("/posts", response_model=dict)
def get_posts(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    tag_name: Optional[str] = Query(None),
    user: Optional[User] = Depends(get_current_user)  # Si get_current_user falla, puedes crear una versión opcional
):
    query = db.query(Post).options(joinedload(Post.author), joinedload(Post.tags))

    if tag_name:
        query = query.join(Post.tags).filter(Tag.name == tag_name)

    total_posts = db.query(func.count()).select_from(query.subquery()).scalar()

    if total_posts == 0:
        raise HTTPException(status_code=404, detail="No posts found")

    posts = query.offset((page - 1) * size).limit(size).all()

    serialized_posts = []
    for post in posts:
        # Calcular el promedio de ratings
        average_rating = db.query(func.avg(Rating.rating))\
                           .filter(Rating.post_id == post.id)\
                           .scalar() or 0.0

        # Consultar la calificación del usuario si está autenticado
        user_rating = None
        if user:
            user_rating = db.query(Rating.rating)\
                            .filter(Rating.post_id == post.id, Rating.user_id == user.id)\
                            .scalar()

        serialized_post = jsonable_encoder(post)
        serialized_post["author"] = jsonable_encoder(post.author)
        serialized_post["tags"] = jsonable_encoder(post.tags)
        serialized_post["average_rating"] = average_rating
        serialized_post["user_rating"] = user_rating  # Esta propiedad se usará en el frontend
        serialized_posts.append(serialized_post)

    return {
        "total": total_posts,
        "page": page,
        "size": size,
        "posts": serialized_posts,
    }


# ✅ Create a New Post (Protected)
@router.post("/posts", response_model=PostResponse)
def create_post(post: PostCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    tags = db.query(Tag).filter(Tag.id.in_(post.tag_ids)).all()

    db_post = Post(title=post.title, content=post.content, author_id=user.id, tags=tags)  # 🔹 FIXED
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


@router.get("/posts/{id}", response_model=PostResponse)
def get_post(id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    post = (
        db.query(Post)
        .options(joinedload(Post.author), joinedload(Post.tags))
        .filter(Post.id == id)
        .first()
    )
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Calcular el promedio de ratings para el post
    average_rating = db.query(func.avg(Rating.rating)) \
                       .filter(Rating.post_id == id) \
                       .scalar() or 0.0
    
    # Serializar el post e incluir el average_rating
    serialized_post = jsonable_encoder(post)
    serialized_post["average_rating"] = average_rating
    return serialized_post


@router.put("/posts/{id}", response_model=PostResponse)
def update_post(id: int, post_data: PostCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    db_post = db.query(Post).filter(Post.id == id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Ensure only the author can update the post
    if db_post.author_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")

    # Update fields including is_published
    db_post.title = post_data.title
    db_post.content = post_data.content
    db_post.is_published = post_data.is_published  # Aseguramos que se actualice este campo

    # Handle tag updates if provided
    if post_data.tag_ids:
        db_post.tags = db.query(Tag).filter(Tag.id.in_(post_data.tag_ids)).all()

    db.commit()
    db.refresh(db_post)
    return db_post


# ✅ Delete a Post (Only the Author Can Delete)
@router.delete("/posts/{id}")
def delete_post(id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # ✅ Ensure only the author can delete the post
    if post.author_id != user.id:  # 🔹 FIXED
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")

    db.delete(post)
    db.commit()
    return {"message": "Post deleted successfully"}
