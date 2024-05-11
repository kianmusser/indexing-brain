FROM restic/restic

RUN apk add --no-cache tini

ENTRYPOINT ["/sbin/tini", "-g", "--"]
CMD ["sleep", "infinity"]
