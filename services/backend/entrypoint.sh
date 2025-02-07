#!/bin/bash

HOST=postgres
PORT=5432

while ! nc -z $HOST $PORT; do sleep 1; done;
sleep 0.2

python3 manage.py migrate

exec "$@"
