FROM node:20-alpine3.21

WORKDIR /app

ENV PATH="$PATH:/app/node_modules/.bin"

COPY . /app
RUN npm install
RUN node prebuild.js
RUN vite build

# CMD [ "tail", "-f" ]

FROM nginx:1.27.0-alpine

WORKDIR /app

EXPOSE 8080

# COPY --from=0 /app/. /app/
COPY --from=0 /app/src/dist/. /app

COPY --from=0 /app/src/music/. /app/music
COPY --from=0 /app/src/img/. /app/img
COPY --from=0 /app/src/models/. /app/models
COPY --from=0 /app/src/langs/. /app/langs
COPY --from=0 /app/src/favicon.svg /app

COPY ./prod.conf /etc/nginx/conf.d/

CMD [ "nginx", "-g", "daemon off;" ]
