FROM python:3.13.0-bullseye
RUN useradd -ms /bin/sh -u 1001 app
USER app

EXPOSE 1972

WORKDIR /app

COPY --chown=app:app . /app
RUN pip3 install -r requirements.txt

# ENTRYPOINT [ "bash", "entrypoint.sh" ]
CMD [ "python3", "-m", "jurigged", "pong.py" ]
# CMD [ "python3", "pong.py" ]
