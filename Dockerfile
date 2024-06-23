FROM node:20-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY build/ build/

RUN npm i --only=production

CMD ["node","build/index.js"]