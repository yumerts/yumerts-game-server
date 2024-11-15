FROM node:lts-alpine
WORKDIR /app
COPY . .
RUN npm install --only=production && npm cache clean --force && npm install -g typescript

RUN tsc ./src/index.ts --outDir build
CMD ["node","./build/index.js"]

EXPOSE 8080