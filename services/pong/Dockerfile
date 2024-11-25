FROM python:3.12.0
RUN useradd -ms /bin/sh -u 1001 app
USER app

EXPOSE 1972

COPY requirements.txt /app/requirements.txt
WORKDIR /app

RUN pip3 install -r requirements.txt

COPY --chown=app:app . /app

# CMD [ "jurigged", "-v", "pong.py" ]

ENTRYPOINT [ "bash", "entrypoint.sh" ]
CMD [ "python3", "pong.py" ]
