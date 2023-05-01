
import express, { Request,  Response } from 'express';
import { checkSchema, validationResult } from 'express-validator';
import axios from 'axios';
import bcrypt from 'bcrypt';
import User from '../models/users';
import Om from '../models/om';
import votingSession from '../models/weekly';
import { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
// no idea why i have to import it like this to work
const jwt = require("jsonwebtoken");
const router = express.Router();


let unprotected_paths = ["/register","/login"]
router.use(async (req, res, next) => {
    
// log request when done
  res.on("finish", ()=> {
    console.log(`${res.statusCode} | Request to ${req.path} from ${req.hostname} (${req.get('user-agent')}) | ${new Date()}`)
  })


  // if unproceted path is hit just continue.
  if(unprotected_paths.includes(req.path)) { return next(); }
  

  // validating token integrity
  if(!req.cookies['Ptoken']) return res.status(401).send("no cookies");
  let token = jwt.verify(req.cookies['Ptoken'], process.env.TOKEN_SECRET, (err: JsonWebTokenError,data: JwtPayload) =>{
    return data
  })
  if(!token) return res.status(403).send("tokeninvalid");
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
    if(!req.query.week || !req.query.year) return res.status(400).send("week/year neeeds to be specified")
    
    let this_week = await votingSession.findOne({where:{
      // @ts-ignore
      week: parseInt(req.query.week as string),
      year: parseInt(req.query.year as string),
    }})

    if(!this_week) return res.status(204).send("No voting session for this week")
    res.locals.votingSession = this_week;
  }

// retarded filtering for administrator only routes
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
    "/sounds/all/",
    "/sounds/delete",
    "/sounds/delete/"
  ].includes(req.path) &&
  !token.administrator  
  ) return res.status(401).send("You are not the administrator")
  res.locals.token = token

  next()
})
  

module.exports = router;