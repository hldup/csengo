import express, { Express, Request, Response } from 'express';
import fs from 'fs';
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import dbInit from "./init";
import User from './models/users';
import { checkSchema, header, validationResult } from 'express-validator';
import Session from './models/sessions';
const crypto = require('crypto')

const app: Express = express()
app.use(express.json());

// dotENV
const port = 3000;

// checking if db exits -> create one 
(async () => {
  if (!fs.existsSync('./database.sqlite')) {
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    }) 
    await db.close();

    await dbInit();

    let options = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$'
    // creating administrator account
    const password = Array.from(crypto.getRandomValues(new Uint32Array(64))) 
    .map((x) => options[x as number % options.length])
    .join('')

    await User.create({
      administrator: true,
      password: password,
      username: "admin",
      om: 1,
    })
  }
})()


// api route for /login
// TODO encrypt data on client side with PGP or something like that
app.get('/login',
  // header checking
  checkSchema({
    username: {
      in: ["headers"],
      isString: true,
      notEmpty: true,
    },
    password: {
      in: ["headers"],
      isString: true,
      notEmpty: true,
    }
    }),
    async (req:Request, res:Response ) => {
    // error handeling for headers/formdata
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    // cache useragent/ip and check if the requests sent in the past 10 minutes is less then 10
    let user = await User.findOne({where: {username: req.headers.username }})
    if(!user) return res.sendStatus(401); // in case no user with username exits
    if (user.password != req.headers.password) return res.sendStatus(401); // in case password is incorrect

    // finding user session
    let user_session = await Session.findOne({where: {
      user: user.id 
    } })

    // in case already has session
    if (user_session) return res.send(user_session.token);
    
    let options = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$'
    const token = Array.from(crypto.getRandomValues(new Uint32Array(128))) 
    .map((x) => options[x as number % options.length])
    .join('')
    
    user_session = await Session.create({
      user: user.id,
      token: token,
      // 2 week expiry
      expires: Date.now() + 1209600000
    })

    // sending session token
    res.send({
      token: user_session.token,
      expiry: user_session.expires
    })
})


app.listen(port, () => {
  console.log(`Listening on ${port}`)
})