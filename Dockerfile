FROM node:14.15.3

ARG BUILD_ID
ARG BUILD_SHA

ENV IC_BUILD_ID=gh-$BUILD_ID
ENV IC_BUILD_SHA=$BUILD_SHA

WORKDIR /app
ADD package.json package.json
RUN npm install --only=production

ADD backend/ backend/

EXPOSE 8080
CMD node backend/server.js
