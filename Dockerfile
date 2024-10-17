FROM node:20-alpine AS build

WORKDIR /app
ENV DOCKER=true

COPY package.json .
COPY pnpm-lock.yaml .
COPY patches/ patches/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

FROM node:20-alpine AS runtime

WORKDIR /app
ENV DOCKER=true
ENV NODE_ENV=production

EXPOSE 3000

COPY --from=build /app/package.json .
COPY --from=build /app/pnpm-lock.yaml .
COPY --from=build /app/patches/ patches/
COPY --from=build /app/build build/

RUN pnpm install --frozen-lockfile

CMD ["node","build/index.js"]
