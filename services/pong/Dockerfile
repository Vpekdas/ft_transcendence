FROM python:3.12.0
RUN useradd -ms /bin/sh -u 1001 app
USER app

WORKDIR /app

COPY --chown=app:app . /app
RUN pip3 install -r requirements.txt

CMD [ "jurigged", "-v", "pong.py" ]
