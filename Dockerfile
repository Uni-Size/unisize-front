FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for environment variables
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

ARG VITE_OPTIONAL_MEASUREMENT
ENV VITE_OPTIONAL_MEASUREMENT=$VITE_OPTIONAL_MEASUREMENT

ARG VITE_BRAND_NAME
ENV VITE_BRAND_NAME=$VITE_BRAND_NAME

# dev 배포에서만 전달합니다. 운영 빌드에서는 전달하지 않아 빈 값으로 폴백됩니다.
ARG VITE_DEV_ADMIN_ID
ENV VITE_DEV_ADMIN_ID=$VITE_DEV_ADMIN_ID

ARG VITE_DEV_ADMIN_PASSWORD
ENV VITE_DEV_ADMIN_PASSWORD=$VITE_DEV_ADMIN_PASSWORD

ARG VITE_DEV_STAFF_ID
ENV VITE_DEV_STAFF_ID=$VITE_DEV_STAFF_ID

ARG VITE_DEV_STAFF_PASSWORD
ENV VITE_DEV_STAFF_PASSWORD=$VITE_DEV_STAFF_PASSWORD

RUN npm run build

# Production image, serve with nginx
FROM nginx:alpine AS runner

# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
