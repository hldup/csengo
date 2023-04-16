
/*
Class/models imports
*/
import dbInit from "./init";
import User from './models/users';
import Sound from './models/sound';
import Om from './models/om';
import Vote from './models/votes';

/*
Application imports
*/
import express, { Express, Request,  Response, query } from 'express';
import fs from 'fs';
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import { checkSchema, validationResult } from 'express-validator';
import { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import axios from 'axios'; // better than js fetch
import dayjs from "dayjs"; //getting week of the year with this 2kb package cus im lazy
import votingSession from "./models/weekly";
const crypto = require('crypto'); 
const cors = require("cors")
const multer = require('multer'); // smart body parser for getting files out of form
const cookieParser = require('cookie-parser'); // for parsing cookies that store jwt
const bodyParser = require('body-parser'); // body parser for parsing da body
const weekofyear = require('dayjs/plugin/weekOfYear')
const jwt = require('jsonwebtoken'); // jwt for token verification
dayjs.extend(weekofyear)

/*
    Defining storage for mp3s
*/
const storage = multer.diskStorage({
  // @ts-ignore
  destination: function (req, file, cb) {
    cb(null, './data/sounds')
  },
  // @ts-ignore
  filename: function (req, file, cb) {
    cb(null, random(64) + '.mp3')
  }
})
const upload = multer({storage: storage})


require('dotenv').config()
/*
    Creating app
*/
const app: Express = express()
app.use(express.json());
app.use(bodyParser.json());
app.use(cors({ credentials: true, origin: true }))
app.use(cookieParser())

/**
 * Middleware for handeling bad requests 
  TODO: implement session based auth checking 
  */
let unprotected_paths = ["/register","/login"]
app.use(async (req, res, next) => {
  
  if(unprotected_paths.includes(req.path)) {
    // check for brute force attacks via redis caching
    return next();
  }
  
  if(!req.cookies['Ptoken']) return res.sendStatus(401);
  let token = jwt.verify(req.cookies['Ptoken'], process.env.TOKEN_SECRET, (err: JsonWebTokenError,data: JwtPayload) =>{
    return data
  })
  if(!token) return res.sendStatus(403);
  if(token.expires < Date.now() ) return res.sendStatus(498);
  if(req.get('user-agent') != token.agent ) return res.status(401).send("User-agent mismatch!") 
  
  // Filtering here {in the middleware} instead of repeating this code 3x 
  if( [
    "/sounds/vote",
    "/sounds/vote/",
    "/sounds/devote",
    "/sounds/devote/",
    "/sounds/",
    "/sounds"
    ].includes(req.path)){
    let this_week = await votingSession.findOne({where:{
      // @ts-ignore
      week: dayjs(Date.now()).week(),
      year: new Date().getFullYear(),
    }})

    if(!this_week) return res.status(204).send("No voting session for this week")
    res.locals.votingSession = this_week;
  }
 if(
  [
    "/weekly",
    "/weekly/",
    "/weekly/edit",
    "/weekly/edit/",
    "/weekly/new",
    "/weekly/new/",
    "/weekly/delete",
    "/weekly/delete/",
    "/sounds/add",
    "/sounds/add/",
    "/sounds/all",
    "/sounds/all/"
  ].includes(req.path) &&
  !token.administrator  
  ) return res.status(401).send("You are not the administrator")
  res.locals.token = token
  res.on("finish", ()=> {
    console.log(`${res.statusCode} | Request to ${req.path} from ${req.hostname} (${req.get('user-agent')}) | ${new Date()}`)
  })
  
  next()
})
  

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
  else if(process.env.DEV){
    await dbInit()
  }
  if (!fs.existsSync("./data/sounds")){
     fs.mkdirSync("./data/sounds", {recursive: true});
  }
})()


app.post('/login',
  // header checking
  checkSchema({
    username: {
      in: ['body'],
      isString: true,
      notEmpty: true,
    },
    password: {
      in: ['body'],
      isString: true,
      notEmpty: true,
    },
    hcaptchaKey: {
      isString: true,
      in: ['body'],
      notEmpty: true
    },   
  }),
  async (req: Request, res: Response) => {
    
    // error handeling for headers/formdata
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    if(!process.env.DEV){
      // // hcaptcha key validation
      let response = await axios({
        method: "GET",
        url: "https://hcaptcha.com/siteverify",
        params: {
              response: req.body.hcaptchaKey,
              secret: process.env.HCAPTCHA_SECRET as string
        }
      })
      if (!response.data.success) return res.sendStatus(401);
      }

    // cache useragent/ip and check if the requests sent in the past 10 minutes is less then 10
    let user = await User.findOne({ where: { username: req.body.username } })
    if (!user) return res.sendStatus(401); // in case no user with username exits
    if (user.password != req.body.password) return res.sendStatus(401); // in case password is incorrect
    let token = jwt.sign(
      {
         id: user.id, 
         expires: Date.now() + 1209600000,
         agent: req.get('user-agent'),
         login: new Date().toISOString(),
         session: "sessionid",
         administrator: user.administrator,
      }, process.env.TOKEN_SECRET) 
    
      // in case already has session
    res.cookie('Ptoken', token);
    res.sendStatus(200);
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
    if(!process.env.DEV){
      // // hcaptcha key validation
      let response = await axios({
        method: "GET",
        url: "https://hcaptcha.com/siteverify",
        params: {
              response: req.body.hcaptchaKey,
              secret: process.env.HCAPTCHA_SECRET as string
        }
      })
      if (!response.data.success) return res.sendStatus(401);
    }

    let user = await User.findOne({ where: { username: req.body.username } });
    // if user already exists return
    if (user) return res.sendStatus(403);

    let user_om = await Om.findOne({ where: { id: req.body.om } });
    // if the om id given by user is not in db return as 401 
    if (!user_om) return res.sendStatus(401);

    user = await User.findOne({ where: { om: req.body.om } });
    // if there is an user already with the om
    if (user) return res.sendStatus(403);

    // creating user in DB
    user = await User.create({
      username: req.body.username,
      password: req.body.password,
      om: req.body.om,
      administrator: false
    })
    let token = jwt.sign(
      {
         id: user.id, 
         expires: Date.now() + 1209600000,
         agent: req.get('user-agent'),
         login: new Date().toISOString(),
         session: "sessionid"

      }, process.env.TOKEN_SECRET) 
    
    res.cookie("Ptoken", token,
    {
      httpOnly: false,
      expires: new Date(Date.now() + 1209600000) 
    })
    res.sendStatus(200)

  }
)

app.post('/sounds/add',
  upload.single("sound"),
  checkSchema({
   name: {
    isString: true,
    notEmpty: true,
   },
  }),
  async (req: Request, res: Response) => {

    // error handeling for headers/formdata
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    // if user is not administrator
    if (  !(await User.findOne({where: {id: res.locals.token.id }}))?.administrator ) return res.sendStatus(401);

    // @ts-ignore
    if(req.file?.mimetype != "audio/mpeg"){
      res.statusCode = 400
      return res.send("File not audio")
    }
    // @ts-ignore
    let filename = req.file?.filename;
    Sound.create({
      path: filename,
      name: req.body.name,
    })
    res.sendStatus(200)
} )
app.get('/sounds',
  async (req: Request, res: Response) => {
    // @ts-ignore
    let sounds = []
    
    // @ts-ignore
    for(let sound of res.locals.votingSession?.sounds ){  
      let dbrecord = await Sound.findOne({
      attributes: ["id","name","votes"],
      where: {id: sound}
       })   
       if (dbrecord) {
        // @ts-ignore
         sounds.push(dbrecord)
       }
    }     
    if(sounds.length == 0) return res.sendStatus(404)

    // maybe add filtering for only this weeks vote
    const user_votes = await Vote.findAll(
      {
        where: {user: res.locals.token.id },
        attributes: ["sound"]
      }).then((data)=>{
        let raw: string[] = []
        for(let sound of data){
          raw.push(sound.dataValues.sound)
        }
        return raw
      })

    res.send({
      // @ts-ignore
      sounds: sounds,
      user_votes: user_votes
    })
} )

app.get('/sounds/all',
  async (req: Request, res: Response) => {
    
    // @ts-ignore
    let sounds= await Sound.findAll({ attributes: ["id","name","votes"] })

    if(sounds.length == 0) return res.sendStatus(404)
    res.send(sounds)
} )


app.post('/sounds/vote',
  async (req: Request, res: Response) => {    
    if(!req.query.id) return res.sendStatus(400);
   

    // in case user has already voted reject
    const vote = await Vote.findOne({where: {user: res.locals.token.id, sound: req.query.id as string }});
    if(vote) return res.status(201).send("You have already voted for this")
    let sound = await Sound.findOne({ where:{id: req.query.id as string}})
    if(!sound) return res.status(404).send("No sound is found under that id");
    await sound.update({ votes: sound.votes + 1})

    await Vote.create({user: res.locals.token.id, sound: sound.id })
    res.sendStatus(200)
} )

app.post('/sounds/devote',
  async (req: Request, res: Response) => {    
    if(!req.query.id) return res.sendStatus(400);
       // in case user has already voted reject
    const vote = await Vote.findOne({where: {user: res.locals.token.id, sound: req.query.id as string }});
    if(!vote) return res.status(404).send("You have not voted for this!")
    
    // checking if sound exists which is pretty retarded but who cares
    let sound = await Sound.findOne({ where:{id: req.query.id as string}})
    if(!sound) return res.status(404).send("No sound is found under that id");
    await sound.update({ votes: sound.votes - 1})
    
    await Vote.destroy({where: {user: res.locals.token.id, sound: sound?.id }})

    res.sendStatus(200)
} )

app.get('/sounds/:id',
  async (req: Request, res: Response) => {    
    if(!req.params.id) return res.sendStatus(400);

    let sound = await Sound.findOne({where:{ id: req.params.id }});
    if(!sound) return res.sendStatus(404);

    res.sendFile(`/data/sounds/${sound.path}`, {root: __dirname })
} )

app.post('/weekly/new',
  checkSchema({
    sounds: {
      exists: true,
      isArray:true,
    },
    "sounds.*":{
      isString:true,
      isUUID: true,
    },
    week: {
      in: "query",
      exists: true,
      isNumeric: true,
    },
    year:{
      in: "query",
      exists: true,
      isNumeric: true,
    }
  }),
  async (req: Request, res: Response) => {    
  
    // error handeling for headers/formdata
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    // checking if sounds exist
    for (let id of req.body.sounds){
      if( !await Sound.findOne({where:{id: id}}) ) return res.status(400).send()
    }

    // checking if a Vsession exists 
    if( await votingSession.findOne({where:{week: req.query["week"] as string }})) return res.status(409).send("There is already a voting declared for that week, maybe edit it istead!")

    await votingSession.create({
      sounds: req.body.sounds,
      week: parseInt(req.query["week"] as string),
      year: parseInt(req.query["year"] as string),
    })

    res.send("Created the voting session")
} )

app.post('/weekly/edit',
  checkSchema({
    sounds: {
      exists: true,
      isArray:true
    },
    "sounds.*":{
      isString:true,
      isUUID: true
    },
    id: {
      in: "query",
      exists: true,
      isUUID: true
    }
  }),
  async (req: Request, res: Response) => {    
  
    // error handeling for headers/formdata
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    // checking if a Vsession exists 
    if(!await votingSession.findOne({where:{id: req.query.id as string }})) return res.status(404).send("There isn't a voting session under this id")

    // checking if sounds exist
    for (let id of req.body.sounds){
      if( !await Sound.findOne({where:{id: id}}) ) return res.status(400).send(" a sound given in a list does not exist")
    }
    await votingSession.update({
        sounds: req.body.sounds
    },{where:{id:req.query.id as string}})
    res.send("Voting session edited")
} )

app.post('/weekly/edit',
  checkSchema({
    id: {
      in: "query",
      exists: true,
      isUUID: true
    }
  }),
  async (req: Request, res: Response) => {    
  
    // error handeling for headers/formdata
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    // checking if a Vsession exists 
    if(!await votingSession.findOne( {where:{id: req.query.id as string}} )) return res.status(404).send("No voting session can be found under that id ")

    // @ts-ignore
    await votingSession.destroy({where:{id: req.query.id}})
    res.send("Voting session edited")
} )
app.get('/weekly',
  async (req: Request, res: Response) => {    
    let sessions = await votingSession.findAll({
      attributes: ["id","sounds","week","year"]
    })
    if(!sessions || sessions.length == 0) return res.status(404).send("Ther are no voting sessions!")
    res.send(sessions);

} )






app.listen(port, () => {
  console.log(`Listening on ${port}`)
})
