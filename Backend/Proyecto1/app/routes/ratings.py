from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from app.database import get_db
from app.models import Rating, Post, User
from app.schemas import RatingCreate, RatingResponse
from app.auth import get_current_user

router = APIRouter()

@router.post("/ratings", response_model=RatingResponse)
def rate_post(
    rating_data: RatingCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # Verificar que el post existe
    post = db.query(Post).filter(Post.id == rating_data.post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Buscar todas las calificaciones para este post y usuario
    existing_ratings = db.query(Rating).filter(
        Rating.post_id == rating_data.post_id,
        Rating.user_id == user.id
    ).all()

    if existing_ratings:
        # Usar el primer registro como el principal y actualizar su rating
        main_rating = existing_ratings[0]
        main_rating.rating = rating_data.rating

        # Eliminar cualquier registro duplicado que exista (si hubiera)
        if len(existing_ratings) > 1:
            for dup in existing_ratings[1:]:
                db.delete(dup)
        db.commit()
        db.refresh(main_rating)
    else:
        # Insertar una nueva calificación si no existe ninguna
        main_rating = Rating(
            post_id=rating_data.post_id,
            rating=rating_data.rating,
            user_id=user.id
        )
        db.add(main_rating)
        db.commit()
        db.refresh(main_rating)

    # Calcular el promedio actualizado de calificaciones para el post
    avg_rating = db.query(func.avg(Rating.rating)).filter(
        Rating.post_id == rating_data.post_id
    ).scalar() or 0.0

    return RatingResponse(new_average=float(avg_rating))
