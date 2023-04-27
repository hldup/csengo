
<br>
<br>
<h1 align="center"> Csengo

<br>

 ![GitHub issues](https://img.shields.io/github/issues/berryes/csengo?color=%23BF1363&style=for-the-badge) ![GitHub last commit](https://img.shields.io/github/last-commit/berryes/csengo?color=%23BF1363&logoColor=%23BF1363&style=for-the-badge) ![GitHub](https://img.shields.io/github/license/berryes/csengo?color=%23BF1363&logoColor=%23BF1363&style=for-the-badge)
</h1>

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
- CSS: Custom & examples from codepen (GPLv3)
- UI framework: *Ant vue design (adminpanel only)*

# Running
1. Clone the repo
```
git clone https://github.com/berryes/csengo
```

2. Build docker image for server
```
cd csengo/server && docker build -t berryes/csengoserver .
```

3. Run server
```
docker run -it -p 3000:3000 --name csengoserver berryes/csengoserver
```

4. Build docker image for the frontend
```
cd .. && cd frontend && docker build -t berryes/csengoclient .
```

3. Run frontend
```
docker run -it -p 8080:8080 --name csengofrontend berryes/csengoclient
```




# Contributing & feature request
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
