FROM nginx:1.27.0-alpine

EXPOSE 443

RUN apk add openssl

RUN mkdir /etc/nginx/ssl
RUN openssl req -x509 -newkey rsa:4096 -keyout /etc/nginx/ssl/key.pem -out /etc/nginx/ssl/cert.pem -sha256 -days 3650 -nodes -subj "/C=FR/ST=Ile-de-France/L=Paris/O=42Paris/OU=/CN=ft_transcendence.42.fr"

COPY ./50-proxy.conf /etc/nginx/conf.d/

CMD [ "nginx", "-g", "daemon off;" ]
