# Noteorious
#### Deadly Note Revived
## Secure Note-Sharing, Passwords, Credentials.

### Features

- **Secure Encryption**: All notes are encrypted using **AES256**, ensuring that your data is safe from unauthorized access.
- **Easy Sharing**: Share notes with others through unique, secure links that automatically delete after being accessed.
- **Privacy-First Design**: Focuses on privacy and security, ensuring that your notes are only accessible to those with the correct decryption password.

### Introduction

Noteorious is a JavaScript and Python app that allows users to send and share sensitive data securely. Using **strong AES256 encryption** sharing notes is safe and secure. Even if the database is compromised, without the decryption keys the information **is useless for any attacker or even owner of the server.**

### Installation

#### DEV

> For Frontend:
```bash
# Start backend
pushd backendv2
docker compose up -d
popd

# Start Vite Development server
# Assuming bun is installed
cd frontendv2
bun add vite
bun install
bun dev
```

#### PRODUCTION

This will start the application in production mode with **NGINX** as a proxy. You might want to tweak the `vhost` file in `.frontendv2/docker/vhost.conf` to suit your needs.

- Then start the containers with **Docker Compose**:
```bash
docker compose up -d
```
- Access at **http://localhost:4200/**

Clean the containers

```bash
docker compose down
```

### Usage

1. Type your note in the textbox and click `Generate`. The text will be replace **with a link to your note** and click `Copy and Erase` to copy it to the clipboard and erase the message.

2. Share the link with your intended recipient. The URL is composed of the _unique note identifier_ + _decryption password_.

**Important**: Once a note is retrieved, it gets deleted from the database to ensure privacy and security.



> Example of URL
```ini
http://localhost:4200/megURjYSfZRoip73AfoG7g#3aa96a0d6be4ded54e810d123cf71757
```

### Tech stack

 * **Frontend**: `JavaScript`, `Vue 3 + Tailwind CSS`
 * **Backend**: `Python 3`, `FastAPI`
 * **Database**: `Redis`

#### Support
You can support me with transfer to card Tinkoff: `2200700732424113`
