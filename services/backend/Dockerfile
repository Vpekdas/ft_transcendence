FROM python:3.12.0-alpine3.18

EXPOSE 8000

WORKDIR /app
COPY ./requirements.txt /app/requirements.txt

RUN apk add --no-cache postgresql-libs && \
    apk add --no-cache --virtual .build-deps gcc musl-dev postgresql-dev && \
    pip3 install -r requirements.txt --no-cache-dir && \
    apk --purge del .build-deps

COPY . /app

ENTRYPOINT [ "sh", "entrypoint.sh" ]
CMD [ "python3", "manage.py", "runserver", "0.0.0.0:8000" ]
