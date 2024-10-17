FROM node:20-alpine AS build

WORKDIR /app
ENV DOCKER=true

COPY package.json .
COPY package-lock.json .
COPY patches/ patches/

RUN pnpm ci

COPY . .

RUN pnpm run build

FROM node:20-alpine AS runtime

WORKDIR /app
ENV DOCKER=true
ENV NODE_ENV=production

EXPOSE 3000

COPY --from=build /app/package.json .
COPY --from=build /app/package-lock.json .
COPY --from=build /app/patches/ patches/
COPY --from=build /app/build build/

RUN pnpm ci

CMD ["node","build/index.js"]
