# [IMPORTANT] Must be built from the root of the project for the COPY/paths to work

ARG APP_NAME=main
ARG NODE_VERSION=16.15.0
ARG PNPM_VERSION=7
ARG PORT=3000

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

FROM node:${NODE_VERSION}-alpine AS runner

ARG APP_NAME
ARG PORT

WORKDIR /app

LABEL maintainer="Thomas Ramé <thomas.rame@beta.gouv.fr>"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

USER nextjs

COPY --from=installer "/app/apps/${APP_NAME}/next.config.js" .
COPY --from=installer "/app/apps/${APP_NAME}/package.json" .

COPY --from=installer --chown=nextjs:nodejs "/app/apps/${APP_NAME}/.next/standalone" ./
COPY --from=installer --chown=nextjs:nodejs "/app/apps/${APP_NAME}/.next/static" "./apps/${APP_NAME}/.next/static"
COPY --from=installer --chown=nextjs:nodejs "/app/apps/${APP_NAME}/public" "./apps/${APP_NAME}/public"

ENV CMD_APP_NAME $APP_NAME
ENV PORT $PORT
EXPOSE $PORT

CMD node apps/"${CMD_APP_NAME}"/server.js
