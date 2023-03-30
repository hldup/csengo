import express, { Express, Request, response, Response } from 'express';
import fs from 'fs';
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import dbInit from "./init";
import User from './models/users';
import { checkSchema, validationResult } from 'express-validator';
import Session from './models/sessions';
import Om from './models/om';
import axios from 'axios';
import Sound from './models/sound';
import { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
const crypto = require('crypto');
const multer = require('multer');
const upload = multer({dest: "data/sounds/"})
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
// defining app
const app: Express = express()
app.use(express.json());
app.use(bodyParser.json());

require('dotenv').config()
  

function random(len: number): string {
  let options = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$'
  const token = Array.from(crypto.getRandomValues(new Uint32Array(len)))
    .map((x) => options[x as number % options.length])
    .join('')
  return token
}

// dotENV
const port = process.env.PORT;

// checking if db exits -> create one 
(async () => {
  if (!fs.existsSync('./database.sqlite')) {
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    })
    await db.close();

    await dbInit();
    await User.create({
      administrator: true,
      password: random(64),
      username: "admin",
      om: 1,
    })
  }
})()


// api route for /login
// TODO encrypt data on client side with PGP or something like that
app.post('/login',
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
  async (req: Request, res: Response) => {
    
    // error handeling for headers/formdata
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    // cache useragent/ip and check if the requests sent in the past 10 minutes is less then 10
    let user = await User.findOne({ where: { username: req.headers.username } })
    if (!user) return res.sendStatus(401); // in case no user with username exits
    if (user.password != req.headers.password) return res.sendStatus(401); // in case password is incorrect
    let session = await Session.findOne({where:{user: user.id}})
    if(session) return res.send( {
      token: jwt.sign({ session: session.token, expiry: session.expires  }, process.env.TOKEN_SECRET)
    }
    );

     session = await Session.create({
      user: user.id,
      token: random(128),
      expires: (Date.now()+ 604_800_000 ) 
    })
    let token = jwt.sign({ session: session.token, expiry: session.expires  }, process.env.TOKEN_SECRET)

    // in case already has session
    res.send({token:token});
  });

app.post('/register',
  checkSchema({
    username: {
      isString: true,
      notEmpty: true
    },
    password: {
      isString: true,
      notEmpty: true
    },
    om: { isString: true, notEmpty: true },
    hcaptchaKey: {
      isString: true,
      notEmpty: true
    },
  }),
  async (req: Request, res: Response) => {
    // error handeling for headers/formdata
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    // hcaptcha key validation
    let response = await axios({
      method: "GET",
      url: "https://hcaptcha.com/siteverify",
      params: {
        response: req.body.hcaptchaKey,
        secret: process.env.HCAPTCHA_SECRET as string
      }
    })
    if (!response.data.success) return res.sendStatus(401);


    let user = await User.findOne({ where: { username: req.body.username } });
    // if user already exists return
    if (user) return res.sendStatus(201);

    let user_om = await Om.findOne({ where: { id: req.body.om } });
    // if the om id given by user is not in db return as 401 
    if (!user_om) return res.sendStatus(401);

    user = await User.findOne({ where: { om: req.body.om } });
    // if there is an user already with the om
    if (user) return res.sendStatus(201);

    // creating user in DB
    user = await User.create({
      username: req.body.username,
      password: req.body.password,
      om: req.body.om,
      administrator: false,
    })

    // creating a session for the user
    let session = await Session.create({
      user: user.id,
      token: random(128),
      // 2 week expiry
      expires: Date.now() + 1209600000
    });
    
    let token = jwt.sign({ session: session.token, expiry: session.expires  }, process.env.TOKEN_SECRET)

    res.send({
      token: token
    })

  }
)

app.post('/sounds/add',
  upload.single('sound'),
  checkSchema({
   name: {
    isString: true,
    notEmpty: true,
   },

  }),
  async (req: Request, res: Response) => {

      let token = jwt.verify(req.headers.authorization?.split(' ')[1], process.env.TOKEN_SECRET, (err: JsonWebTokenError,data: JwtPayload) =>{
        return data
      })
      if(!token) return res.sendStatus(403);
    
      // @ts-ignore
    let filename = req.file?.filename;
    
    Sound.create({
      path: filename,
      name: req.body.name,
    })
    res.sendStatus(200)
} )


app.listen(port, () => {
  console.log(`Listening on ${port}`)
})
