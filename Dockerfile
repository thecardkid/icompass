FROM node:8.17.0

ARG

WORKDIR /app
ADD backend/ backend
ADD package.json package.json

RUN npm install

EXPOSE 8080
CMD node backend/server.js
