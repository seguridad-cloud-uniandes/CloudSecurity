from fastapi import FastAPI
from app.routes.users import router as users_router
from app.routes.posts import router as posts_router
from app.routes.tags import router as tags_router

app = FastAPI(
    title="Blog API",
    description="API para gestionar usuarios, publicaciones y etiquetas.",
    version="1.0.0",
)

app.include_router(users_router)
app.include_router(posts_router)
app.include_router(tags_router) 

@app.get("/")
def read_root():
    return {"message": "Bienvenido a la API del blog"}
