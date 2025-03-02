# CloudSecurity
CloudSecurity

# README
---

## Tabla de Contenidos
- [Descripción del Proyecto](#descripción-del-proyecto)
- [Backend](#backend)
  - [Requisitos](#requisitos)
  - [Instalación](#instalación)
  - [Configuración](#configuración)
  - [Rutas Disponibles](#rutas-disponibles)
  - [Migraciones de Base de Datos](#migraciones-de-base-de-datos)
  - [Autenticación](#autenticación)
  - [Modelo de Datos](#modelo-de-datos)
- [Base de datos](#base-de-datos)
- [Frontend](#frontend)
  - [Instalación](#instalación-frontend)
  - [Componentes Principales](#componentes-principales)
  - [Páginas](#páginas)
  - [Contexto](#contexto)
- [Cómo Ejecutar el Proyecto](#cómo-ejecutar-el-proyecto)
- [Contacto](#contacto)

---
<!-- BEGIN_TF_DOCS -->

## Descripción del Proyecto
Este repositorio contiene la configuración completa para la aplicación **Blog App** que gestiona usuarios, publicaciones, etiquetas y calificaciones, utilizando **FastAPI** para el backend y **React** para el frontend.

## Backend
### Requisitos
- Python 3.10+
- FastAPI
- SQLAlchemy
- Alembic
- SQLAlchemy
- PostgreSQL
- JWT (JSON Web Tokens)
- Passlib para el hashing de contraseñas

### Instalación
1. Clonar el repositorio.
   ```bash
   git clone https://github.com/tu_usuario/tu_repositorio.git
   cd tu_repositorio/Backend
   ```
3. Crear un entorno virtual:
   ```bash
   python -m venv venv
   source venv/bin/activate # Linux/MacOS
   venv\Scripts\activate # Windows
   ```
4. Instalar dependencias:
   ```bash
   pip install -r requirements.txt
   ```
5. Configurar las variables de entorno en un archivo `.env`.

### Configuración
Las variables de entorno necesarias son:
```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/blogdb
SECRET_KEY=your_secret_key_here
```

### Rutas Disponibles
- `/auth/login`: Autenticación de usuario.
- `/auth/request-password-reset`: Solicitud de reseteo de contraseña.
- `/users`: CRUD de usuarios.
- `/posts`: CRUD de publicaciones.
- `/tags`: Gestión de etiquetas.
- `/ratings`: Calificación de publicaciones.

### Migraciones de Base de Datos
Las migraciones se manejan con **Alembic**. 

Para generar una nueva migración:
```bash
alembic revision --autogenerate -m "Descripción de la migración"
```

Para aplicar migraciones:
```bash
alembic upgrade head
```

Para revertir la última migración:
```bash
alembic downgrade -1
```

### Autenticación
El sistema de autenticación se basa en **JWT (JSON Web Tokens)** con la librería **FastAPI Security**.
- Registro de usuarios.
- Inicio de sesión con generación de tokens.
- Reseteo de contraseña con tokens de un solo uso.

### Modelo de Datos

- **User**: Almacena información del usuario.
- **Post**: Publicaciones creadas por los usuarios.
- **Tag**: Etiquetas asociadas a publicaciones.
- **Rating**: Calificaciones que los usuarios dan a las publicaciones.
- **post_tags**: Relación muchos a muchos entre publicaciones y etiquetas.

## Database
Esta base de datos consta de seis tablas principales para un sistema de blog con usuarios, posts, etiquetas y calificaciones. Las relaciones y constraints se reflejan de la siguiente manera:

- **users**: Almacena usuarios, con email y username únicos.
- **posts**: Contiene la información de cada publicación y referencia a un autor (users).
- **tags**: Define etiquetas únicas por nombre.
- **post_tags**: Relación de muchos-a-muchos entre posts y tags.
- **ratings**: Calificaciones de usuarios a posts, con restricción de una calificación única por post/usuario.
- **alembic_version**: Tabla de control de versiones de migraciones.

Relación principal:
- **Users 1**:N Posts (un usuario puede tener muchos posts).
- **Users 1**:N Ratings (un usuario puede dar muchas calificaciones).
- **Posts 1**:N Ratings (un post puede tener muchas calificaciones).
- **Posts N**:M Tags (vía post_tags).
 
Integridad referencial:
  * Mantenida mediante Foreign Keys en posts, post_tags y ratings.
  * Evita la eliminación o inserción de registros que rompan la consistencia.
  * Se revisará la política de borrado para cada FK (por ejemplo, si al eliminar un user se deben eliminar sus posts o sus ratings).

Índices únicos: para evitar duplicados en campos críticos (users.email, users.username, etc.) y en relaciones (ratings(post_id, user_id)).

Timestamps: created_at / updated_at no tienen default ni triggers automáticos por defecto en la definición de la tabla. Esto se suele manejar en la aplicación o con migraciones que establezcan defaults o triggers.

## Versión de la Base de Datos
- **Motor**: PostgreSQL 14.15
- **Método de migraciones**: Alembic (indicada por la tabla alembic_version).

## Tabla users

**Propósito**: Almacena la información principal de los usuarios del blog (credenciales, email, etc.).

| Columna | Tipo | Nulabilidad | Default | Descripcion |
|------|-------------|------|---------|:--------:|
| <a name="input_id"></a> [id](#input\_id) | integer | NOT NULL | nextval('users_id_seq'::regclass) | Identificador único (PK). |
| <a name="input_username"></a> [username](#input\_username) | character varying | NOT NULL | (sin default) | Nombre de usuario. Único en la BD. |
| <a name="email"></a> [email](#input\_email) | character varying | NOT NULL | (sin default) | Correo electrónico. Único en la BD. |
| <a name="hashed_password"></a> [hashed_password](#input\_hashed_password) | scharacter varying | NOT NULL | (sin default) | Contraseña en formato hash. |
| <a name="input_created_at"></a> [created_at](#input\_created_at) | timestamp without time zone | NOT NULL | (sin default) | Fecha/hora de creación del usuario (si se usa). |
| <a name="password_reminder"></a> [password_reminder](#input\_password_reminder) | character varying(255) | NOT NULL | 'default reminder'::character varying | Campo extra para recordatorio de contraseña. |

Restricciones e Índices

- PRIMARY KEY
  * users_pkey: btree en (id).
- Únicos
  * ix_users_email (UNIQUE): btree en (email).
  * ix_users_username (UNIQUE): btree en (username).
- Índices adicionales
  * ix_users_id: btree en (id) (redundante con la PK).

 Relaciones (Foreign Keys desde otras tablas)

- posts.author_id_fkey: en la tabla posts, la columna author_id referencia users(id).
- ratings.user_id_fkey: en la tabla ratings, la columna user_id referencia users(id).

  ## Tabla posts

**Propósito**: Almacena las publicaciones (posts) del blog.

| Columna | Tipo | Nulabilidad | Default | Descripcion |
|------|-------------|------|---------|:--------:|
| <a name="input_id"></a> [id](#input\_id) | integer | NOT NULL | nextval('users_id_seq'::regclass) | Identificador único (PK). |
| <a name="input_title"></a> [title](#input\_title) | character varying | NOT NULL | (sin default) | Título del post. |
| <a name="content"></a> [content](#input\_content) | text | NOT NULL | (sin default) | Contenido principal del post. |
| <a name="author_id"></a> [author_id](#input\_author_id) | integer | NOT NULL | (sin default) | Referencia al usuario autor (FK a users). |
| <a name="input_created_at"></a> [created_at](#input\_created_at) | timestamp without time zone | NOT NULL | (sin default) | Fecha/hora de creación. |
| <a name="updated_at"></a> [updated_at](#input\_updated_at) | timestamp without time zone | NOT NULL | (sin default) | Fecha/hora de última actualización. |
| <a name="password_reminder"></a> [password_reminder](#input\_password_reminder) | boolean | NOT NULL | (sin default) | Indica si el post está publicado o no. |

Restricciones e Índices

- PRIMARY KEY
  * posts_pkey: btree en (id).
- Índices adicionales
  * ix_posts_id: btree en (id) (redundante con la PK).

Relaciones

- Foreign Keys 
  * posts_author_id_fkey: (author_id) -> users(id). 
    Esto asegura que si se elimina un user, se podría restringir o anular la relación (dependiendo de la política de   borrado configurada). (La salida no muestra explícitamente la política ON DELETE.)
- Es Referenciado por 
  * post_tags.post_id_fkey: en la tabla post_tags, la columna post_id referencia posts(id).
  * ratings_post_id_fkey: en la tabla ratings, la columna post_id referencia posts(id).
 
## Tabla tags

**Propósito**: Almacena etiquetas (tags) para clasificar los posts.

| Columna | Tipo | Nulabilidad | Default | Descripcion |
|------|-------------|------|---------|:--------:|
| <a name="input_id"></a> [id](#input\_id) | integer | NOT NULL | nextval('tags_id_seq'::regclass) | Identificador único (PK). |
| <a name="input_name"></a> [name](#input\_name) | character varying | NOT NULL | (sin default) | Nombre de la etiqueta, único. |

Restricciones e Índices

- PRIMARY KEY
  * tags_pkey: btree en (id).
- Índices único
  * ix_tags_name: UNIQUE btree en (name).
- Índices adicionales
  * ix_tags_id: btree en (id) (redundante con la PK).

Relaciones 

- Es referenciado por 
  * posts_tags_tag_id_fkey: en la tabla post_tags, la columna tag_id referencia tags(id). 
      
  ## Tabla post_tags

**Propósito**: Tabla intermedia para la relación muchos-a-muchos entre posts y tags.

| Columna | Tipo | Nulabilidad | Default | Descripcion |
|------|-------------|------|---------|:--------:|
| <a name="input_post_id"></a> [post_id](#input\_post_id) | integer | NOT NULL | (sin default) | Referencia a la tabla posts. |
| <a name="input_tag_id"></a> [tag_id](#input\_tag_id) | integer | NOT NULL | (sin default) | Referencia a la tabla tags. |

Restricciones e Índices

- PRIMARY KEY
  * posts_tags_pkey: btree en (post_id, tag_id). 
    Define la clave primaria compuesta.
- Foreign Keys
  * post_tags_post_id_fkey: (post_id) -> posts(id).
  * post_tags_tag_id_fkey: (tag_id) -> tags(id).

No hay columnas adicionales (ej. created_at) según la definición actual.

## Tabla ratings

**Propósito**: Almacena calificaciones que los usuarios hacen sobre los posts.

| Columna | Tipo | Nulabilidad | Default | Descripcion |
|------|-------------|------|---------|:--------:|
| <a name="input_id"></a> [id](#input\_id) | integer | NOT NULL | nextval('ratings_id_seq'::regclass) | Identificador único (PK). |
| <a name="input_user_id"></a> [user_id](#input\_user_id) | integer | NOT NULL | (sin default) | Referencia a users(id). |
| <a name="input_posts_id"></a> [post_id](#input\_posts_id) | integer | NOT NULL | (sin default) | Referencia a posts(id). |
| <a name="input_rating"></a> [rating](#input\_rating) | double precision | NOT NULL | (sin default) | Valor de la calificación (p. ej. 1.0 a 5.0). |

Restricciones e Índices

- PRIMARY KEY
  * ratings_pkey: btree en (id).
- Índices único
  * unique_post_user_rating: UNIQUE CONSTRAINT en (post_id, user_id). 
  * Un usuario no puede calificar el mismo post más de una vez.
- Índices adicionales
  * ix_ratings_id: btree en (id) (redundante con la PK).
- Foreign Keys 
  * ratings_post_id_fkey: (post_id) -> posts(id).
  * ratings_user_id_fkey: (user_id) -> users(id).

  ## Tabla alembic_version

**Propósito**: Tabla de control de versiones utilizada por Alembic (herramienta de migraciones de SQLAlchemy).
  
| Columna | Tipo | Nulabilidad | Default | Descripcion |
|------|-------------|------|---------|:--------:|
| <a name="input_version_num"></a> [version_num](#input\_version_num) | character varying(32) | NOT NULL | (sin default) | Identificador único de la versión de migración. |
| <a name="input_tag_id"></a> [tag_id](#input\_tag_id) | integer | NOT NULL | (sin default) | Referencia a la tabla tags. |

Restricciones e Índices

- PRIMARY KEY
  * alembic_version_pkc: btree en (version_num).

No tiene referencias a otras tablas ni columnas adicionales.

 ## Comentarios adicionales

- **Claves Foráneas**: aquí se confirman varias Foreign Keys: 
  * posts.author_id -> users.id
  * ratings.user_id -> users.id
  * ratings.post_id -> posts.id
  * post_tags.post_id -> posts.id
  * post_tags.tag_id -> tags.id

- **Restricciones de Unicidad**
  * users.email y users.username son únicos.
  * tags.name es único.
  * ratings(post_id, user_id) es único.
  * post_tags(post_id, tag_id) es la PK compuesta, por lo que es único por definición.

- **Tipos de Datos**
  * Se usan character varying y text para texto, integer para IDs y double precision para calificaciones.
  * Los campos created_at y updated_at están declarados como timestamp without time zone.
  * is_published es un boolean.
  * password_reminder tiene un tamaño máximo de 255 caracteres y un default 'default reminder'.

- **Migraciones**
  * Alembic utiliza la tabla alembic_version para controlar las migraciones aplicadas. Cada versión se almacena en version_num.

---

## Frontend
### Requisitos
- Node.js 18+
- React 18+
- TypeScript
- TailwindCSS
- React Router
  
### Instalación
1. Navegar a la carpeta `Frontend`.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Ejecutar la aplicación:
   ```bash
   npm run dev
   ```

### Componentes Principales
- `Navbar`: Barra de navegación con autenticación.
- `PostCard`: Tarjetas para mostrar publicaciones.
- `InteractiveRatingStars`: Calificación de publicaciones.
- `LoadingSpinner`: Indicador de carga.
- `CustomQuill`: Editor de texto enriquecido con Quill.
- 
### Páginas
- `LoginPage`: Inicio de sesión.
- `CreatePostPage`: Creación de publicaciones.
- `EditPostPage`: Edición de publicaciones.
- `CreateTagPage`: Creación de etiquetas.
- `MyPostsPage`: Listado de publicaciones propias.

### Contexto
El contexto de autenticación se maneja con **AuthContext** usando **React Context API**.




























## Outputs

No outputs.
<!-- END_TF_DOCS -->

## Authors
- Yeimy Valencia
- Oscar Giraldo
- Nicolás Pico García
