# [IMPORTANT] Must be built from the root of the project for the COPY/paths to work

ARG APP_NAME=docs
ARG NODE_VERSION=16.15.0
ARG NGINX_VERSION=1.23.2
ARG PNPM_VERSION=7

# ------------------------------------------

FROM node:${NODE_VERSION}-alpine AS node-with-pnpm

ARG PNPM_VERSION

WORKDIR /app

RUN apk add --no-cache libc6-compat
RUN apk update
RUN npm install -g "pnpm@${PNPM_VERSION}" turbo

# ------------------------------------------

FROM node-with-pnpm AS builder

ARG APP_NAME

COPY . .

RUN turbo prune --scope="${APP_NAME}" --docker

# ------------------------------------------

FROM node-with-pnpm AS installer

ARG APP_NAME

COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install

COPY turbo.json turbo.json
COPY --from=builder /app/out/full/ .

RUN pnpm turbo run build --filter="${APP_NAME}"...

# ------------------------------------------

FROM nginx:${NGINX_VERSION} AS runner

ARG APP_NAME

WORKDIR /app

LABEL maintainer="Thomas Ramé <thomas.rame@beta.gouv.fr>"

# Remove all Nginx default files
RUN rm /usr/share/nginx/html/*

# Put all our code inside that directory that lives in the container
COPY --from=installer "/app/apps/${APP_NAME}/storybook-static/" /usr/share/nginx/html

# Override default settings
COPY --from=installer "/app/apps/${APP_NAME}/nginx-node.conf" /etc/nginx/conf.d/default.conf

EXPOSE 80
