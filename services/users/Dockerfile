FROM python:3.12.0

EXPOSE 8000

WORKDIR /app
COPY . /app
RUN pip3 install -r requirements.txt

CMD [ "python3", "manage.py", "runserver", "0.0.0.0:8000" ]
# CMD [ "tail", "-f" ]
