# sudo docker run --rm -p 8000:8000 ctfd/ctfd:latest
# sudo docker run -it --entrypoint sh --rm -p 8000:8000 ctfd/ctfd:latest
# sudo docker run --rm -p 8000:8000 packed4rmadillo/juice-shop:latest
# https://juice-shop.herokuapp.com/#/search
#FROM ctfd/ctfd:latest
#ENTRYPOINT ["/bin/sh", "-c", "python import.py /tmp/dtf.2019-11-12.zip && /opt/CTFd/docker-entrypoint.sh"]

FROM python:2.7-alpine
RUN apk update && \
    apk add python python-dev linux-headers libffi-dev gcc make musl-dev py-pip mysql-client git openssl-dev
RUN adduser -D -u 1001 -s /bin/bash ctfd

WORKDIR /opt/CTFd
RUN mkdir -p /opt/CTFd /var/log/CTFd /var/uploads

COPY requirements.txt .
COPY dtf.2019-11-12.zip /tmp

RUN pip install -r requirements.txt

COPY . /opt/CTFd

RUN for d in CTFd/plugins/*; do \
      if [ -f "$d/requirements.txt" ]; then \
        pip install -r $d/requirements.txt; \
      fi; \
    done;

RUN chmod +x /opt/CTFd/docker-entrypoint.sh
RUN chown -R 1001:1001 /opt/CTFd
RUN chown -R 1001:1001 /var/log/CTFd /var/uploads


RUN apk add tcpflow
# USER 1001
EXPOSE 8000

ENTRYPOINT ["/opt/CTFd/docker-entrypoint.sh"]
