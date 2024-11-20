FROM node:20

VOLUME [ "/app" ]
WORKDIR /app

ENV PATH="$PATH:/app/node_modules/.bin"

COPY package*.json ./

RUN npm install

EXPOSE 8080

# CMD ["tail", "-f"]
CMD [ "npm", "run", "dev" ]
