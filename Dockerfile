# Define versions as build arguments for easy updates
ARG NODE_VERSION=24.12.0
ARG PNPM_VERSION=10.25.0
ARG ALPINE_VERSION=3.22
ARG PNPM_URL="https://github.com/pnpm/pnpm/releases/download/v${PNPM_VERSION}/pnpm-linuxstatic-x64"

# --- Build stage ---
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS build

ARG PNPM_URL
ARG GIT_BRANCH
ARG GIT_COMMIT_SHA

WORKDIR /app
ENV DOCKER=true
ENV GIT_BRANCH=${GIT_BRANCH}
ENV GIT_COMMIT_SHA=${GIT_COMMIT_SHA}

# Install pnpm (static binary)
RUN wget -qO /bin/pnpm "${PNPM_URL}" && chmod +x /bin/pnpm

# Copy dependency manifests first (for caching)
COPY package.json .
COPY pnpm-lock.yaml .
COPY patches/ patches/

# Install deps
RUN pnpm install --frozen-lockfile --strict-peer-dependencies

# Copy full source after dependencies are cached
COPY . .

# Build the app (output to /app/build)
RUN pnpm run build


# --- Runtime stage ---
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS runtime

ARG PNPM_URL
ARG GIT_BRANCH
ARG GIT_COMMIT_SHA

WORKDIR /app
ENV DOCKER=true
ENV NODE_ENV=production
ENV GIT_BRANCH=${GIT_BRANCH}
ENV GIT_COMMIT_SHA=${GIT_COMMIT_SHA}

# Install pnpm again for runtime dependency resolution
RUN wget -qO /bin/pnpm "${PNPM_URL}" && chmod +x /bin/pnpm

# App will run on port 3000
EXPOSE 3000

# Copy only required runtime files and build output
COPY --from=build /app/package.json .
COPY --from=build /app/pnpm-lock.yaml .
COPY --from=build /app/patches/ patches/
COPY --from=build /app/build build/

# Install only production dependencies
RUN pnpm install --frozen-lockfile --strict-peer-dependencies

# Start the app
CMD ["node","build/index.js"]
