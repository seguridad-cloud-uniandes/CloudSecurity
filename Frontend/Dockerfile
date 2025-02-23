# Stage 1: Build
FROM --platform=linux/amd64 node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm cache clean --force && \
    ROLLUP_SKIP_NODEJS=true npm install --legacy-peer-deps
COPY . .
ENV npm_config_platform=linux \
    npm_config_arch=x64 \
    ROLLUP_SKIP_NODEJS=true
RUN npm run build

# Stage 2: Nginx
FROM nginx:alpine

# Crear directorio para certificados SSL
RUN mkdir -p /etc/nginx/ssl && \
    chmod 700 /etc/nginx/ssl

# Copiar certificados y establecer permisos restrictivos
COPY cert.pem /etc/nginx/ssl/cert.pem
COPY cert.key /etc/nginx/ssl/cert.key
RUN chmod 600 /etc/nginx/ssl/cert.pem && \
    chmod 600 /etc/nginx/ssl/cert.key

# Configurar Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Establecer permisos correctos
RUN chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]