FROM node:carbon

WORKDIR /app
ADD . /app

RUN npm install
RUN npm run build

EXPOSE 8080

CMD node icompass.js
