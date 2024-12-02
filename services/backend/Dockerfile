FROM python:3.12.0
RUN useradd -ms /bin/sh -u 1001 app
USER app

EXPOSE 8000

WORKDIR /app
COPY --chown=app:app ./requirements.txt /app/requirements.txt
RUN pip3 install -r requirements.txt

COPY --chown=app:app . /app

ENTRYPOINT [ "bash", "entrypoint.sh" ]
CMD [ "python3", "manage.py", "runserver", "0.0.0.0:8000" ]
