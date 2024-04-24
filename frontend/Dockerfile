FROM oven/bun:alpine

WORKDIR /usr/src/frontend

COPY package.json ./
COPY bun.lockb ./
COPY src ./

RUN bun i

RUN bun add vite

COPY . .