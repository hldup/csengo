<br>
<br>
<h1 align="center"> Csengo

</h1>

# What's this?

A really basic voting system for deciding which sound becomes the bell at my school.

# Techstack

I choose a rather ez to program techstack because this is a small project. It doesn't need to be that fast either since its just a voting system.

Backend: Typescript
<br>

Also got [an experimental rust backend](https://git.berryez.xyz/berry/csengo-rust) Cus you know. rewrite it in rust.

- ORM: [Sequelize](https://sequelize.org/)
- Web server: [Express-js](https://expressjs.com/)
- Validator: [express-validator](https://express-validator.github.io/docs)

Frontend: JS

- Framework: [Vue](https://vuejs.org/) with [Vite](https://vitejs.dev/)
- CSS: Custom & examples from codepen (MIT)

# Building for production

1. Clone the repo

```
git clone https://github.com/berryes/csengo
```

2. Build docker image for server

```
cd csengo/server && docker build -t berryes/csengoserver .
```

3. Build docker image for the frontend

```
cd .. && cd client && docker build -t berryes/csengoclient .
```

4. Run via docker compose

```yaml
version: "3.9"
# DONT FORGET TO BUILD THE IMAGES FIRST! AND MAKE SURE THEIR ALIASES ARE SET (berryes/csengoserver)
services:
  server:
    image: berryes/csengoserver

    volumes:
      - /root/pollak/sounds/:/data/sounds
    environment:
      PORT: 3000
      HCAPTCHA_SECRET: "secret"
      TOKEN_SECRET: "random long string"
      DB_NAME: csengo
      DB_USER: csengo
      DB_PASS: csengopass
      DB_HOST: csengopostgres
    links:
      - database
    depends_on:
      - database
      - sessionstore

    networks:
      - csengo

  client:
    image: berryes/csengoclient
    networks:
      - csengo

  sessionstore:
    image: redis:latest
    restart: always
    ports:
      - "6379:6379"
    command: redis-server --save 20 1 --loglevel warning --requirepass VErySecurePassWordHere123
    networks:
      - csengo

  database:
    image: "postgres:latest"
    hostname: csengopostgres
    ports:
      - "5432"
    environment:
      POSTGRES_USER: csengo
      POSTGRES_PASSWORD: csengopass
      POSTGRES_DB: csengo

    networks:
      - csengo

networks:
  csengo:
    driver: bridge
```

# Developement

Requirements:

- Redis database
- Postgres database

#### Client (frontend)

1. Install packages

```
yarn install
```

2. Create .env file

```env
VITE_API_URL=http://url-of-host:3000/
```

3. Run the client

```
yarn dev
```

#### Server (backend)

1. Install packages

```
npm install
```

2. Create .env file

```env
PORT=3000
HCAPTCHA_SECRET=get this from the hcaptcha page
TOKEN_SECRET=verylongstriongthatmakesjwttokens

DB_NAME=csengots
DB_USER=root
DB_PASS=root
DB_HOST=csengodb


SESSION_STORE_PASSWORD=VErySecurePassWordHere123
SESSION_STORE_HOST=172.23.0.2
SESSION_STORE_PORT=6379


# delete if not in developement
DEV=1
```

4. run the server

```
npm run serve
```

# Contributing & feature request

I'm looking for people that could maybe join besides me and devour their free time to keep the project going. (Contact me)
You can always make an [issue](https://github.com/berryes/csengo/issues) if you found a vulnerability / bug.
Or you could just fork the repo and fix it yourself then pull a request. <br>
For anymore contact me at [@berry:berryez.xyz](https://matrix.to/#/@berry:berryez.xyz) on the matrix or just join the project room for a discussion [#csengo:berryez.xyz](https://matrix.to/#/#csengo:berryez.xyz)

# Authors

- Máté - _frontend & backend_ - [**berryes**](https://matrix.to/#/@berry:berryez.xyz)

# Acknowledgments

- [Login](https://codepen.io/fghty/pen/PojKNEG) - foolish developer
- [Animated blobs](https://codepen.io/ksenia-k/pen/jXbWaJ) - Ksenia Kondrashova

# Developed listening to

[![song](https://github.com/berryes/csengo/blob/main/assets/view.svg?raw=true)](https://open.spotify.com/track/2G0c5XvospcOSyA3t1W2X2?si=67f3ee577ce74012)
