FROM node:20

VOLUME [ "/app" ]
WORKDIR /app

ENV PATH="$PATH:/app/node_modules/.bin"

EXPOSE 5173

# CMD ["tail", "-f"]
CMD [ "npm", "run", "dev" ]
