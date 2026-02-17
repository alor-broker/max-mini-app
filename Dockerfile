# Build stage
FROM node:18-alpine AS build

# Build argument for environment (development or production)
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# App environment override (e.g. development, production)
ARG REACT_APP_ENV
ENV REACT_APP_ENV=${REACT_APP_ENV}

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy lockfile and package.json
COPY pnpm-lock.yaml package.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM nginx:stable-alpine

# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from build stage to nginx public folder
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
