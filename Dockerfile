FROM node:20-alpine AS build

WORKDIR /app
ENV NODE_ENV=production
ENV CI=true

COPY package.json .
COPY package-lock.json .
COPY patches/ patches/

RUN npm ci

COPY . .

RUN npm run check

RUN npx playwright install

RUN npm run test
RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
EXPOSE 3000

COPY --from=build /app/package.json .
COPY --from=build /app/package-lock.json .
COPY --from=build /app/patches/ patches/
COPY --from=build /app/build build/

RUN npm ci --only=production

CMD ["node","build/index.js"]