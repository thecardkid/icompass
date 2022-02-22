FROM node:14.15.3

WORKDIR /app
ADD package.json package.json
RUN npm install --only=production
ADD config config
RUN ./node_modules/.bin/webpack --config ./config/webpack/vendor.js

ADD . .

ENV IC_ROOT = /app
ENV NODE_ENV = production
ENV GA_TRACKING_ID = ''

RUN ./node_modules/.bin/webpack --config ./config/webpack/prod.js

EXPOSE 8080
CMD node backend/server.js
