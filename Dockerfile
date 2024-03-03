FROM node:21-alpine

WORKDIR /app

COPY app/ .

RUN npm i --only=production

CMD ["node","build/index.js"]