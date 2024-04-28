# Deadly Note
## Securely share passwords, credentials, and notes.

### Introduction

Deadly Note is a simple Javascript and Python application that allows users to send and share sensitive data securely. Using **strong AES256 encryption** sharing notes is safe and secure. Even if the database is compromised, without the decryption keys the information **is useless for any attacker or even owner of the server**.

### Installation

#### DEV

> WIP

#### PRODUCTION

This will start the application in production mode (`NGINX`). You might want to tweak the `vhost` file in `.frontendv2/docker/vhost.conf` to suit your needs.

- Then start the containers with Docker Compose:
```
docker compose up -d
```
- Then access **http://localhost:4200/**

Clean the containers

```
docker compose down
```

### Usage

Type your note in the textbox and click `Generate`. The text will be replace **with a link to your note**.

URLs are composed of the _unique note identifier_ + _decryption password_.

> Example
```
http://localhost:4200/megURjYSfZRoip73AfoG7g#3aa96a0d6be4ded54e810d123cf71757
```

## Once a note is retrieved, **it gets deleted** from the database.

### Tech stack

 * **Frontend**: `Vue 3`
 * **Backend**: `Python 3`, `FastAPI`
 * **Database**: `Redis`
 
