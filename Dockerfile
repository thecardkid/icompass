FROM node:carbon

WORKDIR /app
ADD ./ /app

RUN npm install

EXPOSE 8080

RUN npm run build
# Must build JS bundle at runtime because some logic rely on
# NODE_ENV being set
CMD npm run start-server
