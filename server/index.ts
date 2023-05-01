
/*
Class/models imports
*/
import dbInit from "./init";
import User from './models/users';

/*
Application imports
*/
import express, { Express } from 'express';
import fs from 'fs';
import sqlite3 from 'sqlite3'
import crypto  from "crypto";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import bcrypt from 'bcrypt';
require('dotenv').config()


function random(len: number): string {
  let options = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$'
  const token = Array.from(crypto.getRandomValues(new Uint32Array(len)))
    .map((x) => options[x as number % options.length])
    .join('')
  return token
}


/*
    Creating app
*/
const app: Express = express()
app.use(express.json());
app.use(bodyParser.json());
app.use(cors({ credentials: true, origin: true }))
app.use(cookieParser())
// dotENV
const port = process.env.PORT;

// checking if db exits -> create one 
(async () => {

  if (!fs.existsSync('./database.sqlite')) {

     new sqlite3.Database("./database.sqlite", 
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, 
    (err) => { 
        return console.error(err)
    });
    
    const password = random(64);
    console.log("!!! ADMIN PASSWORD: ",password) 
    await dbInit();
    await User.create({
      administrator: true,
      password: (await bcrypt.hash(password, await bcrypt.genSalt(10))),
      username: "admin",
      om: 99999999,
    })
  }
  else if(process.env.DEV){
    await dbInit()
  }
  if (!fs.existsSync("./data/sounds")){
     fs.mkdirSync("./data/sounds", {recursive: true});
  }
})()
const middleware = require("./middleware/protected")
app.use(middleware);

const soundController = require('./routes/sounds.route');
app.use('/sounds/', soundController);

const weeklyController = require("./routes/weekly.route");
app.use("/weekly", weeklyController);

const userController = require("./routes/user.route")
app.use("/", userController);



app.listen(port, () => {
  console.log(`Listening on ${port}`)
})
