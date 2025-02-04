from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Post, Tag
from app.schemas import PostCreate, PostResponse
from sqlalchemy.orm import joinedload 
from fastapi import Query
from pydantic import parse_obj_as
from fastapi.encoders import jsonable_encoder
from typing import List

router = APIRouter()

# Publish and unpublish
@router.patch("/posts/{id}/publish", response_model=PostResponse)
def toggle_publish_post(id: int, publish: bool, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post.is_published = publish
    db.commit()
    db.refresh(post)
    return post


@router.get("/posts", response_model=dict)
def get_posts(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),  # Página actual, por defecto 1
    size: int = Query(10, ge=1, le=100),  # Tamaño de página, entre 1 y 100
    tag_name: str = Query(None)  # Filtro opcional por etiqueta
):
    
    query = db.query(Post).options(joinedload(Post.author), joinedload(Post.tags))

    if tag_name:
        query = query.join(Post.tags).filter(Tag.name == tag_name)

    total_posts = db.query(Post).count()
    if total_posts == 0:
        raise HTTPException(status_code=404, detail="No posts found")

    offset = (page - 1) * size
    posts = db.query(Post).options(joinedload(Post.author)).offset(offset).limit(size).all()

    # Serializar los posts para incluir el autor como un diccionario
    serialized_posts = []
    for post in posts:
        serialized_post = jsonable_encoder(post)
        serialized_post["author"] = jsonable_encoder(post.author)
        serialized_post["tags"] = jsonable_encoder(post.tags)
        serialized_posts.append(serialized_post)

    return {
        "total": total_posts,
        "page": page,
        "size": size,
        "posts": serialized_posts
    }



# Crear un nuevo post
@router.post("/posts", response_model=PostResponse)
def create_post(post: PostCreate, db: Session = Depends(get_db)):

    tags = db.query(Tag).filter(Tag.id.in_(post.tag_ids)).all()

    db_post = Post(title=post.title, content=post.content, author_id=post.author_id)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

# Obtener un post por ID
@router.get("/posts/{id}", response_model=PostResponse)
def get_post(id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

# Actualizar un post por ID
@router.put("/posts/{id}", response_model=PostResponse)
def update_post(id: int, post: PostCreate, db: Session = Depends(get_db)):
    db_post = db.query(Post).filter(Post.id == id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    db_post.title = post.title
    db_post.content = post.content
    db_post.author_id = post.author_id
    db.commit()
    db.refresh(db_post)
    return db_post

# Eliminar un post por ID
@router.delete("/posts/{id}")
def delete_post(id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(post)
    db.commit()
    return {"message": "Post deleted successfully"}
