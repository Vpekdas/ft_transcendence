FROM node:20
RUN useradd -ms /bin/sh -u 1001 app
USER app

WORKDIR /app

ENV PATH="$PATH:/app/node_modules/.bin"

EXPOSE 8080

COPY --chown=app:app . /app
RUN npm install

CMD [ "npm", "run", "dev" ]
