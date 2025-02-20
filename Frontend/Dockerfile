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

# Copy SSL certificates
COPY cert.pem /etc/nginx/ssl/cert.pem
COPY cert.key /etc/nginx/ssl/cert.key

# Configure Nginx with HTTPS to backend
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /api/ { \
        proxy_pass https://pocblog-dev-alb-1155122966.us-east-1.elb.amazonaws.com:8443; \
        proxy_ssl_certificate /etc/nginx/ssl/cert.pem; \
        proxy_ssl_certificate_key /etc/nginx/ssl/cert.key; \
        proxy_ssl_verify off; \
    } \
}' > /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

RUN chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
