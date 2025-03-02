# CloudSecurity
CloudSecurity

# README
---

## Tabla de Contenido
- [Descripción del proyecto](#descripción-del-proyecto)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Backend](#backend)
  - [Requisitos](#requisitos)
  - [Instalación](#instalación)
  - [Configuración](#configuración)
  - [Rutas disponibles](#rutas-disponibles)
  - [Migraciones de base de datos](#migraciones-de-base-de-datos)
  - [Autenticación](#autenticación)
  - [Modelo de datos](#modelo-de-datos)
- [Base de datos](#base-de-datos)
  - [Estructura de tablas RDS](#estructura-de-tablas-RDS)
 - [Frontend](#frontend)
  - [Requisitos](#requisitos)
  - [Instalación](#instalación)
  - [Componentes principales](#componentes-principales)
  - [Páginas](#páginas)
- [Información adicional](#información-adicional)
- [Decisiones de diseño](#decisiones-de-diseño)
- [Decisiones de seguridad](#decisiones-de-seguridad)
- [Conclusiones y lecciones aprendidas](#conclusiones-y-lecciones-aprendidas)

---
<!-- BEGIN_TF_DOCS -->

## Descripción del Proyecto
Este repositorio contiene la configuración completa para la aplicación **Blog App** que gestiona usuarios, publicaciones, etiquetas y calificaciones, utilizando **FastAPI** para el backend y **React** para el frontend.

---

## Estructura del Proyecto
### Módulos

| Name | Source | Descripción |
|------|--------|---------|
| <a name="module_alembic"></a> [alembic](#module\_alembic) | ./alembic | Gestión de migraciones de bases de datos. |
| <a name="module_app"></a> [app](#module\_app) | ./app | Código principal de la aplicación con la lógica de negocio. |
| <a name="module_public"></a> [public](#module\_public) | ./public | Archivos estáticos y configuración pública. |
| <a name="module_src"></a> [src](#module\_src) | ./src | Código fuente del frontend y backend |

A continuación se describen los módulos utilizados en el backend y el frontend para el desarrollo del proyecto:

### Alembic
Gestión de migraciones con comandos clave.
- Uso: Se utiliza para gestionar las migraciones de la base de datos PostgreSQL.
- Función: Permite la creación, modificación y reversión de esquemas de bases de datos.
- Archivos: Los scripts de migración se encuentran en la carpeta **version**s.
### App
Lógica de negocio con la implementación de la API.
- Uso: Contiene la lógica de negocio de la aplicación.
- Función: Implementación de servicios con FastAPI ara el manejo de rutas, autenticación y servicios de negocio.
- Archivos: Rutas para autenticación, usuarios, publicaciones, etiquetas y calificaciones.
- Archivos principales:
  * `main.py`: Punto de entrada de la aplicación.
  * `routes`: Definición de endpoints.
  * `models`: Definición de modelos de datos.
### Public
Archivos estáticos y configuraciones accesibles.
- Archivos estáticos como imágenes, hojas de estilos y configuración pública.
- Archivos accesibles desde la interfaz de usuario
### Src
Código fuente con organización para frontend y backend.
- Uso: Código fuente principal para el backend con FastAPI.
- Función: Implementación del frontend con **React** y **TailwindCSS**.
- Archivos: Contexto de autenticación y componentes reutilizables.
- Archivos principales:
  * `context`: Manejadores de contexto para la autenticación.
  * `components`: Componentes reutilizables.
  * `pages`: Páginas principales como creación, edición y visualización de publicaciones.
---

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
#### Rutas Disponibles
- `/auth/login`: Autenticación de usuario.
- `/auth/request-password-reset`: Solicitud de reseteo de contraseña.
- `/users`: CRUD de usuarios.
- `/posts`: CRUD de publicaciones.
- `/tags`: Gestión de etiquetas.
- `/ratings`: Calificación de publicaciones.

#### Migraciones de base de datos
Las migraciones se manejan con **Alembic**. 

- Para generar una nueva migración:
```bash
alembic revision --autogenerate -m "Descripción de la migración"
```

- Para aplicar migraciones:
```bash
alembic upgrade head
```

- Para revertir la última migración:
```bash
alembic downgrade -1
```

### Autenticación
![Autenticación](./Frontend/Autenticaci%C3%B3n_App.png)

El sistema de autenticación se basa en **JWT (JSON Web Tokens)** con la librería **FastAPI Security**.
- Registro de usuarios.
- Inicio de sesión con generación de tokens.
- Reseteo de contraseña con tokens de un solo uso.

### Modelo de datos

- **User**: Almacena información del usuario.
- **Post**: Publicaciones creadas por los usuarios.
- **Tag**: Etiquetas asociadas a publicaciones.
- **Rating**: Calificaciones que los usuarios dan a las publicaciones.
- **post_tags**: Relación muchos a muchos entre publicaciones y etiquetas.
---

## Base de datos
Esta base de datos consta de seis tablas principales para un sistema de blog con usuarios, posts, etiquetas y calificaciones. Las relaciones y constraints se reflejan de la siguiente manera:

- **users**: Almacena usuarios, con email y username únicos.
- **posts**: Contiene la información de cada publicación y referencia a un autor (users).
- **tags**: Define etiquetas únicas por nombre.
- **post_tags**: Relación de muchos-a-muchos entre posts y tags.
- **ratings**: Calificaciones de usuarios a posts, con restricción de una calificación única por post/usuario.
- **alembic_version**: Tabla de control de versiones de migraciones.

### Relación principal:
- **Users 1**:N Posts (un usuario puede tener muchos posts).
- **Users 1**:N Ratings (un usuario puede dar muchas calificaciones).
- **Posts 1**:N Ratings (un post puede tener muchas calificaciones).
- **Posts N**:M Tags (vía post_tags).
 
### Integridad referencial:
- Mantenida mediante Foreign Keys en posts, post_tags y ratings.
- Evita la eliminación o inserción de registros que rompan la consistencia.
- Se revisará la política de borrado para cada FK (por ejemplo, si al eliminar un user se deben eliminar sus posts o sus ratings).

### Índices únicos: 
Para evitar duplicados en campos críticos (users.email, users.username, etc.) y en relaciones (ratings(post_id, user_id)).

### Timestamps: 
created_at / updated_at no tienen default ni triggers automáticos por defecto en la definición de la tabla. Esto se suele manejar en la aplicación o con migraciones que establezcan defaults o triggers.

### Versión de la base de datos
- **Motor**: PostgreSQL 14.15
- **Método de migraciones**: Alembic (indicada por la tabla alembic_version).

## Estructura de tablas RDS
![Tablas RDS](./Frontend/RDS_PostgresSQL.png)

### Tabla users
**Propósito**: Almacena la información principal de los usuarios del blog (credenciales, email, etc.).

| Columna | Tipo | Nulabilidad | Default | Descripcion |
|------|-------------|------|---------|:--------:|
| <a name="input_id"></a> [id](#input\_id) | integer | NOT NULL | nextval('users_id_seq'::regclass) | Identificador único (PK). |
| <a name="input_username"></a> [username](#input\_username) | character varying | NOT NULL | (sin default) | Nombre de usuario. Único en la BD. |
| <a name="email"></a> [email](#input\_email) | character varying | NOT NULL | (sin default) | Correo electrónico. Único en la BD. |
| <a name="hashed_password"></a> [hashed_password](#input\_hashed_password) | scharacter varying | NOT NULL | (sin default) | Contraseña en formato hash. |
| <a name="input_created_at"></a> [created_at](#input\_created_at) | timestamp without time zone | NOT NULL | (sin default) | Fecha/hora de creación del usuario (si se usa). |
| <a name="password_reminder"></a> [password_reminder](#input\_password_reminder) | character varying(255) | NOT NULL | 'default reminder'::character varying | Campo extra para recordatorio de contraseña. |

### Restricciones e índices
**PRIMARY KEY**
- users_pkey: btree en (id).
  
**Únicos**
- ix_users_email (UNIQUE): btree en (email).
- ix_users_username (UNIQUE): btree en (username).
  
**Índices adicionales**
- ix_users_id: btree en (id) (redundante con la PK).

### Relaciones (Foreign Keys desde otras tablas)
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

### Restricciones e índices
**PRIMARY KEY**
- posts_pkey: btree en (id).

**Índices adicionales**
- ix_posts_id: btree en (id) (redundante con la PK).

### Relaciones
**Foreign Keys** 
- posts_author_id_fkey: (author_id) -> users(id). 
  Esto asegura que si se elimina un user, se podría restringir o anular la relación (dependiendo de la política de   borrado configurada). (La salida no muestra explícitamente la política ON DELETE.)

**Es Referenciado por**
- post_tags.post_id_fkey: en la tabla post_tags, la columna post_id referencia posts(id).
- ratings_post_id_fkey: en la tabla ratings, la columna post_id referencia posts(id).
 
 ## Tabla tags
**Propósito**: Almacena etiquetas (tags) para clasificar los posts.

| Columna | Tipo | Nulabilidad | Default | Descripcion |
|------|-------------|------|---------|:--------:|
| <a name="input_id"></a> [id](#input\_id) | integer | NOT NULL | nextval('tags_id_seq'::regclass) | Identificador único (PK). |
| <a name="input_name"></a> [name](#input\_name) | character varying | NOT NULL | (sin default) | Nombre de la etiqueta, único. |

### Restricciones e índices

**PRIMARY KEY**
- tags_pkey: btree en (id).

**Indices único**
- ix_tags_name: UNIQUE btree en (name).

**Índices adicionales**
- ix_tags_id: btree en (id) (redundante con la PK).

### Relaciones 
**Es referenciado por** 
- posts_tags_tag_id_fkey: en la tabla post_tags, la columna tag_id referencia tags(id). 
      
## Tabla post_tags
**Propósito**: Tabla intermedia para la relación muchos-a-muchos entre posts y tags.

| Columna | Tipo | Nulabilidad | Default | Descripcion |
|------|-------------|------|---------|:--------:|
| <a name="input_post_id"></a> [post_id](#input\_post_id) | integer | NOT NULL | (sin default) | Referencia a la tabla posts. |
| <a name="input_tag_id"></a> [tag_id](#input\_tag_id) | integer | NOT NULL | (sin default) | Referencia a la tabla tags. |

### Restricciones e índices

**PRIMARY KEY**
- posts_tags_pkey: btree en (post_id, tag_id). 
  Define la clave primaria compuesta.

**Foreign Keys**
- post_tags_post_id_fkey: (post_id) -> posts(id).
- post_tags_tag_id_fkey: (tag_id) -> tags(id).

## Tabla ratings
**Propósito**: Almacena calificaciones que los usuarios hacen sobre los posts.

| Columna | Tipo | Nulabilidad | Default | Descripcion |
|------|-------------|------|---------|:--------:|
| <a name="input_id"></a> [id](#input\_id) | integer | NOT NULL | nextval('ratings_id_seq'::regclass) | Identificador único (PK). |
| <a name="input_user_id"></a> [user_id](#input\_user_id) | integer | NOT NULL | (sin default) | Referencia a users(id). |
| <a name="input_posts_id"></a> [post_id](#input\_posts_id) | integer | NOT NULL | (sin default) | Referencia a posts(id). |
| <a name="input_rating"></a> [rating](#input\_rating) | double precision | NOT NULL | (sin default) | Valor de la calificación (p. ej. 1.0 a 5.0). |

### Restricciones e índices

**PRIMARY KEY**
- ratings_pkey: btree en (id).

**Índices únicos**
- unique_post_user_rating: UNIQUE CONSTRAINT en (post_id, user_id). 
- Un usuario no puede calificar el mismo post más de una vez.

**Índices adicionales**
- ix_ratings_id: btree en (id) (redundante con la PK).

**Foreign Keys**
- ratings_post_id_fkey: (post_id) -> posts(id).
- ratings_user_id_fkey: (user_id) -> users(id).

## Tabla alembic_version
**Propósito**: Tabla de control de versiones utilizada por Alembic (herramienta de migraciones de SQLAlchemy).
  
| Columna | Tipo | Nulabilidad | Default | Descripcion |
|------|-------------|------|---------|:--------:|
| <a name="input_version_num"></a> [version_num](#input\_version_num) | character varying(32) | NOT NULL | (sin default) | Identificador único de la versión de migración. |
| <a name="input_tag_id"></a> [tag_id](#input\_tag_id) | integer | NOT NULL | (sin default) | Referencia a la tabla tags. |

### Restricciones e índices
**PRIMARY KEY**
- alembic_version_pkc: btree en (version_num).

No tiene referencias a otras tablas ni columnas adicionales.

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
### Componentes principales
- `Navbar`: Barra de navegación con autenticación.
- `PostCard`: Tarjetas para mostrar publicaciones.
- `InteractiveRatingStars`: Calificación de publicaciones.
- `LoadingSpinner`: Indicador de carga.
- `CustomQuill`: Editor de texto enriquecido con Quill.

### Páginas
- `LoginPage`: Inicio de sesión.
- `CreatePostPage`: Creación de publicaciones.
- `EditPostPage`: Edición de publicaciones.
- `CreateTagPage`: Creación de etiquetas.
- `MyPostsPage`: Listado de publicaciones propias.

### Contexto
El contexto de autenticación se maneja con **AuthContext** usando **React Context API**.

---

## Información adicional

**Claves foráneas** 
- posts.author_id -> users.id
- ratings.user_id -> users.id
- ratings.post_id -> posts.id
- post_tags.post_id -> posts.id
- post_tags.tag_id -> tags.id

**Restricciones de unicidad**
- users.email y users.username son únicos.
- tags.name es único.
- ratings(post_id, user_id) es único.
- post_tags(post_id, tag_id) es la PK compuesta, por lo que es único por definición.

**Tipos de datos**
- Se usan character varying y text para texto, integer para IDs y double precision para calificaciones.
- Los campos created_at y updated_at están declarados como timestamp without time zone.
- is_published es un boolean.
- password_reminder tiene un tamaño máximo de 255 caracteres y un default 'default reminder'.

**Migraciones**
- Alembic utiliza la tabla alembic_version para controlar las migraciones aplicadas. Cada versión se almacena en version_num.

**Pruebas automatizadas**
- Backend (App):
  * Uso de **pytest** para pruebas unitarias sobre servicios y modelos.
  * Pruebas de integración con la base de datos usando **TestContainers**
- Frontend (Src):
  * Pruebas de componentes con **Jest** y **React Testing Library**.

**Gestión de logs**
- Backend (App):
  * Integración con **AWS CloudWatch Logs** para el envio de logs.
  * Uso del driver de logs de Docker con formato JSON.
- Frontend (Src):
  * Logs de errores y advertencias manejados con **React Error Boundaries**.
  * Limitación de acceso a recursos estáticos con politicas de permisos S3.

**Flujos de trabajo CI/CD**
- Backend:
  * Pipeline de integración y despliegue continuo con **GitHub Actions**
  * Verificación de código con **pre-commit**.
  * BEjecución de pruebas del despliegue.
- Infraestructura:
  * Despliegue automatizado con **Terraform Cloud** o **GitHub Actions**
  * Bloqueo de estado remoto con **AWS DynamoDB**.

**Respaldo y recuperación**
- Base de datos RDS
  * Snapshots para **RDS** que permiten la restauración en AWS.
  * Resplado automático con políticas de retención.
  * Versionado habilitado para **S3** que permite habilitación de versiones previas.
---

## Decisiones de Diseño
**Backend**:
- Arquitectura basada en microservicios con FastAPI.
- Modularización con separación de responsabilidades.
- Uso de contenedores Docker para empaquetado y despliegue.
- Escalabilidad automática con grupos de autoescalado ECS.

**Frontend**:
- Aplicación SPA (Single Page Application) con React.
- Diseño basado en componentes reutilizables.
- Gestión de estado global con React Context API.
- Despliegue estático en S3 con integración al balanceador de carga.
---

## Decisiones de Seguridad
**Backend**:
- Validación y autenticación de usuarios con **JWT**.
- Hashing de contraseñas con **Passlib**.
- Cifrado de datos sensibles con **AWS Secrets Manager**.
- Seguridad en la comunicación con HTTPS y certificados gestionados por **AWS ACM**.

**Frontend**:
- Restricción de accesos con autenticación basada en tokens.
- Manejo de errores con **React Error Boundaries**.
- Limitación de acceso a recursos estáticos con políticas de permisos S3.

## Conclusiones y lecciones aprendidas
**Conclusiones**
- La combinación de **Terraform**, **AWS** y **Docker** permitió automatizar y estandarizar la infraestructura con alta disponibilidad y escalabilidad.
- El uso de microservicios facilita la mantenibilidad y escalabilidad de la aplicación.
- La integración CI/CD garantiza la entrega continua y minimiza errores en los despliegues.

**Lecciones aprendidas**
- La automatización de despliegues mejora la eficiencia, pero requiere una adecuada configuración de permisos para evitar fallos de seguridad.
- El versionado de infraestructura con Terraform permite mantener un historial claro de cambios, aunque demanda una correcta gestión de estados.
- La separación de subredes públicas y privadas incrementa la seguridad, pero requiere una correcta configuración de los grupos de seguridad.
- La implementación de pruebas es clave para garantizar la calidad del código y la estabilidad del sistema.

<!-- END_TF_DOCS -->

## Authors
- Yeimy Valencia
- Oscar Giraldo
- Nicolás Pico García
