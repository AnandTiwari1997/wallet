ARG NODE_VERSION=17.3.0
FROM node:${NODE_VERSION}-slim

ENV NODE_ENV=production

WORKDIR /usr/src/app
COPY package.json .
COPY dist/ .
COPY python/ ../python

RUN npm install --dev

CMD ["node", "server.js"]