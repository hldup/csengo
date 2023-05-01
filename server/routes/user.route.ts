import express, { Request,  Response } from 'express';
import { checkSchema, validationResult } from 'express-validator';
import axios from 'axios';
const router = express.Router();
import bcrypt from 'bcrypt';
import User from '../models/users';
import Om from '../models/om';
// no idea why i have to import it like this to work
const jwt = require("jsonwebtoken");

router.post('/login',
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
    // if hashed pass dont match
    if (!await bcrypt.compare(req.body.password, user.password)) return res.status(401).send();

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

router.post('/register',
  checkSchema({
    username: {
      isString: true,
      notEmpty: true,
      isLength:{ options: { min: 3, max: 64 } },
      // TODO, check for any special charachters that should not be in the db
    },
    password: {
      isString: true,
      notEmpty: true,
      isLength:{ options: { min: 3, max: 64 } }
    },
    om: { isString: true, notEmpty: true },
      // TODO, check for any special charachters that should not be in the db
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
      password: await bcrypt.hash(req.body.password, await bcrypt.genSalt(10)),
      om: req.body.om,
      administrator: false
    })

    let token = jwt.sign({
         id: user.id, 
         expires: Date.now() + 1209600000,
         agent: req.get('user-agent'),
         login: new Date().toISOString(),
         session: "sessionid"
      },
    process.env.TOKEN_SECRET);
      
    res.cookie("Ptoken", token, {
      httpOnly: false,
      expires: new Date(Date.now() + 1209600000) 
    });
    res.sendStatus(200)

  }
)

module.exports = router;