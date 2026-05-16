# Define versions as build arguments for easy updates
ARG NODE_VERSION=24.14.0
ARG PNPM_VERSION=11.1.2
ARG ALPINE_VERSION=3.23
ARG PNPM_URL="https://github.com/pnpm/pnpm/releases/download/v${PNPM_VERSION}/pnpm-linux-x64.tar.gz"

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION}

ARG PNPM_URL
ARG GIT_BRANCH
ARG GIT_COMMIT_SHA

WORKDIR /app
ENV DOCKER=true
ENV NODE_ENV=production
ENV GIT_BRANCH=${GIT_BRANCH}
ENV GIT_COMMIT_SHA=${GIT_COMMIT_SHA}

# Install pnpm (static binary from tar.gz)
RUN wget -qO- "${PNPM_URL}" | tar -xzf - -C /usr/local/bin && chmod +x /usr/local/bin/pnpm

# Copy dependency manifests first (for caching)
COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
COPY patches/ patches/

# Install all deps (incl. dev) — needed because the build runs at container start.
# --prod=false forces dev deps even though NODE_ENV=production is set above.
RUN pnpm install --frozen-lockfile --strict-peer-dependencies --prod=false

# Copy full source after dependencies are cached
COPY . .

# Make entrypoint executable (in case the host bit was lost)
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
