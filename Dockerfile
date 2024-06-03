FROM node:20-alpine AS build-env

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm i --frozen-lockfile

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=build-env /app/build ./build
COPY --from=build-env /app/package.json .
COPY --from=build-env /app/package-lock.json .

RUN npm i --omit=dev --frozen-lockfile

CMD ["node", "build/index.js"]