FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
# Use nginx's built-in template processing — auto-runs envsubst on startup
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
