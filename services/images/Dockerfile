FROM alpine:3.19

RUN apk add --no-cache tini busybox-extras

WORKDIR /var/www/html

ENTRYPOINT ["/sbin/tini", "-g", "--"]

COPY lib/ /lib/

CMD ["httpd", "-f", "-h", "/var/www/html", "-p", "80", "-c", "/lib/httpd.conf"]
EXPOSE 80

HEALTHCHECK --interval=5s --timeout=1500ms --start-period=10s --retries=3 CMD ["/lib/docker-healthcheck.sh"]
