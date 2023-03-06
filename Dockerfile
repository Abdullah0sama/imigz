FROM node:19-bullseye-slim

RUN apt-get update; \
    apt-get install curl -y

WORKDIR /usr/app

COPY package*.json ./

RUN npm install

COPY tsconfig.json ./

COPY src ./src

RUN npm run build

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/server"]