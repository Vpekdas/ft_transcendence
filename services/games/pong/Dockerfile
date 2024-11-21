FROM python:3.12.0

WORKDIR /app

COPY requirements.txt ./requirements.txt
RUN pip3 install -r requirements.txt

CMD [ "jurigged", "-v", "pong.py" ]
