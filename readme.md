
<br>
<br>
<h1 align="center"> Csengo

<br>

 ![GitHub issues](https://img.shields.io/github/issues/berryes/csengo?color=%23BF1363&style=for-the-badge) ![GitHub last commit](https://img.shields.io/github/last-commit/berryes/csengo?color=%23BF1363&logoColor=%23BF1363&style=for-the-badge) ![GitHub](https://img.shields.io/github/license/berryes/csengo?color=%23BF1363&logoColor=%23BF1363&style=for-the-badge)
</h1>

# Disclaimer
This project is still in Alpha and needs testing. Dataloss, breaches and spam might cause the app to fail.

# Plans for the future
 - Backend rewrite in rust?
 - move to session base outh. (using signed jwt now. ik dumb)
 - More functions
 - Offline browser app (Add to homepage)

# What's this?
A really basic voting system for deciding which sound becomes the bell at my school.

# Techstack
I choose a rather ez to program techstack because this is a small project. It doesn't need to be that fast either since its just a voting system.

Backend: Typescript
- ORM: [Sequelize](https://sequelize.org/)
- Web server: [Express-js](https://expressjs.com/)
- Validator: [express-validator](https://express-validator.github.io/docs)

Frontend: JS
- Framework: [Vue](https://vuejs.org/)
- CSS: [Vuetify](https://vuetifyjs.com/)

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
      TOKEN_SECRET: "encryption key, random string"
      DB_NAME: csengo
      DB_USER: csengo
      DB_PASS: csengopass
      DB_HOST: csengopostgres
    links:
      - database
    depends_on:
      - database

    networks:
      - csengo
      
  client:
    image: berryes/csengoclient
    networks:
      - csengo

  database:
    image: 'postgres:latest'
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

#### Client (frontend)
1. install packages
```
yarn install
```

2. create .env file
```env
VITE_API_URL=http://url-of-host:3000/
```

3. run the client
```
yarn dev
```

#### Server (backend)
1. install packages
```
npm install
```

2. create .env file
```env
PORT=3000
HCAPTCHA_SECRET=get this from the hcaptcha page
TOKEN_SECRET=verylongstriongthatmakesjwttokens

DB_NAME=csengots
DB_USER=root
DB_PASS=root
DB_HOST=csengodb

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
- Máté - *frontend & backend* - [**berryes**](https://matrix.to/#/@berry:berryez.xyz)

# Acknowledgments
- [Login](https://codepen.io/fghty/pen/PojKNEG) - foolish developer
- [Animated blobs](https://codepen.io/ksenia-k/pen/jXbWaJ) - Ksenia Kondrashova
- [Shake animation](https://codepen.io/johholl/pen/GpbgJW) - Joh Holl


# Developed listening to 
[![song](https://github.com/berryes/csengo/blob/main/assets/view.svg?raw=true)](https://open.spotify.com/track/2G0c5XvospcOSyA3t1W2X2?si=67f3ee577ce74012)
