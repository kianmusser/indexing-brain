FROM alpine:3.19

RUN apk add --no-cache tini busybox-extras

WORKDIR /var/www/html

ENTRYPOINT ["/sbin/tini", "-g", "--"]

COPY src/ /var/www/html/
COPY lib/ /lib/

CMD ["/lib/entrypoint.sh"]

EXPOSE 80

HEALTHCHECK --interval=5s --timeout=1500ms --start-period=10s --retries=3 CMD ["/lib/docker-healthcheck.sh"]
