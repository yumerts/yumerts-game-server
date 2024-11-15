FROM node:lts-alpine
WORKDIR /app
COPY . .
RUN yarn install --production
CMD ["npm", "run", "start:dev"]
EXPOSE 8080