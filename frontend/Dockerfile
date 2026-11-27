FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Caddy avec le module DuckDNS (certificat via le challenge DNS-01)
FROM caddy:2-builder AS caddy-builder
RUN xcaddy build --with github.com/caddy-dns/duckdns

FROM caddy:2

COPY --from=caddy-builder /usr/bin/caddy /usr/bin/caddy
COPY --from=builder /app/dist /srv
COPY caddy/ /etc/caddy/

EXPOSE 80 443
