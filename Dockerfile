# Build stage
FROM node:20-alpine AS builder

# Vite bakes VITE_* at build time; pass via build-arg (e.g. from docker-compose env_file)
ARG VITE_SPOT_API_BASE_URL
ENV VITE_SPOT_API_BASE_URL=$VITE_SPOT_API_BASE_URL

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Remove default config and use ours
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
