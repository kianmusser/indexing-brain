FROM alpine:3.19

RUN apk add --no-cache tini nodejs npm ripgrep

WORKDIR /app
COPY src/package*.json /app

RUN npm ci

COPY src/ /app

ENTRYPOINT ["/sbin/tini", "-g", "--"]
CMD ["node", "src/index.js", "/names"]
EXPOSE 3000