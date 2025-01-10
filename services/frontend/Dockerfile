FROM node:20-alpine3.21

WORKDIR /app

ENV PATH="$PATH:/app/node_modules/.bin"

EXPOSE 8080

COPY . /app
RUN npm install

CMD [ "npm", "run", "dev" ]
