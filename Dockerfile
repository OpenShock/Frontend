# The pnpm version and the base image line below (tag and digest) are rewritten by
# .github/workflows/update-toolchain.yml - keep their shape if you edit them by hand.
ARG PNPM_VERSION=12.15.0

FROM node:26.9.0-trixie-slim@sha256:3a771f83944bb763050c23c0225c260638c4b7899e7a72485ef75e5e570499e5

ARG PNPM_VERSION

RUN npm install -g pnpm@${PNPM_VERSION}

WORKDIR /app
ENV DOCKER=true

# Copy only files that affect dependency fetching.
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches/ patches/

# Populate pnpm's package store with production and development dependencies.
RUN pnpm fetch

# Copy source code and all workspace package.json files.
COPY . .

# Construct node_modules from the populated store.
RUN pnpm install --offline --frozen-lockfile --strict-peer-dependencies --prod=false

# Make entrypoint executable (in case the host bit was lost)
RUN chmod +x /app/docker-entrypoint.sh

# Frequently changing build metadata goes after dependency installation.
ARG GIT_BRANCH
ARG GIT_COMMIT_SHA

ENV NODE_ENV=production
ENV GIT_BRANCH=${GIT_BRANCH}
ENV GIT_COMMIT_SHA=${GIT_COMMIT_SHA}

EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
