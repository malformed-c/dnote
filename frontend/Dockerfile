FROM oven/bun:alpine

WORKDIR /usr/src/frontend

COPY package.json ./

RUN bun add vite

RUN bun i

COPY . .