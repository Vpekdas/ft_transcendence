FROM python:3.12.0

WORKDIR /app

COPY . /app
RUN pip3 install -r requirements.txt

CMD [ "jurigged", "-v", "pong.py" ]
