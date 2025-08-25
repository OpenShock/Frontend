ARG NODE_VERSION=24.6.0
ARG PNPM_VERSION=10.15.0
ARG ALPINE_VERSION=3.22

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS build

ARG PNPM_VERSION
ARG GIT_BRANCH
ARG GIT_COMMIT_SHA

WORKDIR /app
ENV DOCKER=true
ENV GIT_BRANCH=${GIT_BRANCH}
ENV GIT_COMMIT_SHA=${GIT_COMMIT_SHA}

RUN wget -qO /bin/pnpm "https://github.com/pnpm/pnpm/releases/download/v${PNPM_VERSION}/pnpm-linuxstatic-x64" && chmod +x /bin/pnpm

COPY package.json .
COPY pnpm-lock.yaml .
COPY patches/ patches/

RUN pnpm install --frozen-lockfile --strict-peer-dependencies

COPY . .

RUN pnpm run build

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS runtime

ARG PNPM_VERSION
ARG GIT_BRANCH
ARG GIT_COMMIT_SHA

WORKDIR /app
ENV DOCKER=true
ENV NODE_ENV=production
ENV GIT_BRANCH=${GIT_BRANCH}
ENV GIT_COMMIT_SHA=${GIT_COMMIT_SHA}

RUN wget -qO /bin/pnpm "https://github.com/pnpm/pnpm/releases/download/v${PNPM_VERSION}/pnpm-linuxstatic-x64" && chmod +x /bin/pnpm

EXPOSE 3000

COPY --from=build /app/package.json .
COPY --from=build /app/pnpm-lock.yaml .
COPY --from=build /app/patches/ patches/
COPY --from=build /app/build build/

RUN pnpm install --frozen-lockfile --strict-peer-dependencies

CMD ["node","build/index.js"]
