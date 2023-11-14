<br>
<br>
<h1 align="center"> Csengo

</h1>


# Techstack

I choose a rather ez to program techstack because this is a small project. It doesn't need to be that fast either since its just a voting system.

Backend: Typescript
<br>

- ORM: [Sequelize](https://sequelize.org/)
- Web server: [Express-js](https://expressjs.com/)
- Validator: [express-validator](https://express-validator.github.io/docs)

Frontend: JS

- Framework: [Vue](https://vuejs.org/) with [Vite](https://vitejs.dev/)
- CSS: Custom & examples from codepen (MIT)

# Building for production

1. Clone the repo

```
git clone https://github.com/hldup/csengo
```

2. Build docker image for server

```
cd csengo/server && docker build -t hldup/csengoserver .
```

3. Build docker image for the frontend

```
cd .. && cd client && docker build -t hldup/csengoclient .
```

4. Edit docker compose & run via docker compose

```
docker compose up
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

```bash
cd server & cp .env.example .env
```

4. run the server

```
npm run serve
```

# Contributing & feature request

You can always make an [issue](https://github.com/hldup/csengo/issues) if you found a vulnerability / bug.

# Authors

- Máté - _frontend & backend_
- Klepi - _operate and maintain w <3_
# Acknowledgments

- [Login](https://codepen.io/fghty/pen/PojKNEG) - foolish developer
- [Animated blobs](https://codepen.io/ksenia-k/pen/jXbWaJ) - Ksenia Kondrashova

# Developed listening to

[![song](https://github.com/hldup/csengo/blob/main/assets/view.svg?raw=true)](https://open.spotify.com/track/2G0c5XvospcOSyA3t1W2X2?si=67f3ee577ce74012)
