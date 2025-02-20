from fastapi import FastAPI
from app.routes.users import router as users_router
from app.routes.posts import router as posts_router
from app.routes.tags import router as tags_router
from app.routes.ratings import router as ratings_router  # 🔹 Corrige el nombre aquí
from app.routes.auth import router as auth_router  # 🔹 Agrega la ruta de autenticación
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Blog API",
    description="API para gestionar usuarios, publicaciones y etiquetas.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[ "https://pocblog-dev-alb-1155122966.us-east-1.elb.amazonaws.com",
                    "https://pocblog-dev-alb-1155122966.us-east-1.elb.amazonaws.com:8443",
                    "https://www.pocblog.com",
                    "https://www.pocblog.com:8443",
                    "http://pocblog-dev-alb-1155122966.us-east-1.elb.amazonaws.com",
                    "http://www.pocblog.com"
    ],  # Update to match frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods including OPTIONS
    allow_headers=["*"],  # Allow all headers
)

# 🔹 Incluye todas las rutas correctamente
app.include_router(auth_router, prefix="/auth", tags=["Auth"])  # 🔹 Añadido
app.include_router(users_router, prefix="/users", tags=["Users"])
app.include_router(posts_router, prefix="/posts", tags=["Posts"])
app.include_router(tags_router, prefix="/tags", tags=["Tags"])
app.include_router(ratings_router, prefix="/ratings", tags=["Ratings"])

@app.get("/")
def read_root():
    return {"message": "Bienvenido a la API del blog"}
