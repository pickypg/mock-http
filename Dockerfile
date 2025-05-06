FROM oven/bun:latest

WORKDIR /app

COPY ./ /app

RUN bun install

ENTRYPOINT [ "bun", "src/index.ts" ]