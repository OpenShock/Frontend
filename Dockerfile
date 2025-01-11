ARG NODE_VERSION=20
ARG PNPM_VERSION=9.12.3
ARG ALPINE_VERSION=3.20
ARG GIT_HASH

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS build

WORKDIR /app
ENV DOCKER=true
ENV PNPM_VERSION=${PNPM_VERSION}
ENV GIT_HASH=${GIT_HASH}

RUN wget -qO /bin/pnpm "https://github.com/pnpm/pnpm/releases/latest/download/pnpm-linuxstatic-x64" && chmod +x /bin/pnpm

COPY package.json .
COPY pnpm-lock.yaml .
COPY patches/ patches/

RUN pnpm install --frozen-lockfile --strict-peer-dependencies

COPY . .

RUN pnpm run build

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS runtime

WORKDIR /app
ENV DOCKER=true
ENV NODE_ENV=production
ENV PNPM_VERSION=${PNPM_VERSION}
ENV GIT_HASH=${GIT_HASH}

RUN wget -qO /bin/pnpm "https://github.com/pnpm/pnpm/releases/latest/download/pnpm-linuxstatic-x64" && chmod +x /bin/pnpm

EXPOSE 3000

COPY --from=build /app/package.json .
COPY --from=build /app/pnpm-lock.yaml .
COPY --from=build /app/patches/ patches/
COPY --from=build /app/build build/

RUN pnpm install --frozen-lockfile --strict-peer-dependencies

CMD ["node","build/index.js"]
