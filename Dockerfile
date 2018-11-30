FROM node:carbon-alpine
# Создать директорию app
RUN mkdir -p /usr/app/
WORKDIR /usr/app/
ADD . .
RUN npm i npm@latest -g && npm install

EXPOSE 80
CMD [ "npm", "run", "up" ]
