FROM node:lts-alpine
WORKDIR /app
COPY . .
RUN npm install --only=production && npm cache clean --force && npm install -g typescript
RUN npm i --save-dev @types/ws

ENV DSTACK_SIMULATOR_ENDPOINT="http://host.docker.internal:8090"

RUN tsc --outDir build
CMD ["node","./build/index.js"]

EXPOSE 8080
EXPOSE 8081
EXPOSE 8082