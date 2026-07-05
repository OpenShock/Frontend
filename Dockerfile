# Define versions as build arguments for easy updates
ARG NODE_VERSION=26.3.1
ARG PNPM_VERSION=11.10.0
ARG ALPINE_VERSION=3.23

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION}

ARG PNPM_VERSION
ARG GIT_BRANCH
ARG GIT_COMMIT_SHA

WORKDIR /app
ENV DOCKER=true
ENV NODE_ENV=production
ENV GIT_BRANCH=${GIT_BRANCH}
ENV GIT_COMMIT_SHA=${GIT_COMMIT_SHA}

# Copy dependency manifests first (for caching)
COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
COPY patches/ patches/

# Install pnpm via npm (works on any platform/libc, no tarball extraction needed)
RUN npm install -g pnpm@${PNPM_VERSION}

# Install all deps (incl. dev) — needed because the build runs at container start.
# --prod=false forces dev deps even though NODE_ENV=production is set above.
RUN pnpm install --frozen-lockfile --strict-peer-dependencies --prod=false

# Copy full source after dependencies are cached
COPY . .

# Make entrypoint executable (in case the host bit was lost)
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
