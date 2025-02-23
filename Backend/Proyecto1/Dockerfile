# Usa una imagen base de Python 3.9-slim
FROM python:3.9-slim

# Instala dependencias del sistema para compilar psycopg2
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# Establece el directorio de trabajo en /app
WORKDIR /app

# Copia el archivo de requerimientos y luego instálalos
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia el resto de la aplicación al contenedor
COPY . .

# Expone el puerto 8000 para la aplicación
EXPOSE 8443

# Ejecuta la aplicación con uvicorn usando SSL
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8443", "--ssl-keyfile", "cert.key", "--ssl-certfile", "cert.pem"]
