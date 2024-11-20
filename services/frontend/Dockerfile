FROM node:20

VOLUME [ "/app" ]
WORKDIR /app

ENV PATH="$PATH:/app/node_modules/.bin"

# COPY package.json package-lock.json /app/
# RUN npm i

EXPOSE 8080

# CMD ["tail", "-f"]
ENTRYPOINT [ "bash", "/app/tools/entrypoint.sh" ]
CMD [ "npm", "run", "dev" ]
