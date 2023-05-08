
import express, { Request,  Response } from 'express';
import votingSession, { currentWeek } from '../models/weekly';
import { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import Token from '../models/token';
import { Op } from 'sequelize';
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
 
  // filtering out api request via a API key/token
  if(req.headers.authorization){
    if(!await Token.findOne({where: {key: req.headers.authorization.split(" ")[1] }})) return res.status(400).send("Invalid API key")
    return next()
  }

  // validating token integrity
  if(!req.cookies['Ptoken'] ) return res.status(401).send("You are not authenticated!")
  let token = jwt.verify(req.cookies['Ptoken'], process.env.TOKEN_SECRET, (err: JsonWebTokenError,data: JwtPayload) =>{
    return data
  })
  if(!token) return res.status(403).send("Token invalid");
  if(token.expires < Date.now() ) return res.sendStatus(498);
  if(req.get('user-agent') != token.agent ) return res.status(401).send("User-agent mismatch!");

  // Filtering here {in the middleware} instead of repeating this code 3x 
  if( [
    "/sounds/vote",
    "/sounds/devote",
    "/sounds",
    "/weekly/winners"
    ].includes(req.path)){
    
    // checking if there is a voting session happening as of now
    // if the api hit is asking for the weekly winners just get the last week's session
    let this_week = await currentWeek();
    if(!this_week){ 
       this_week = await votingSession.findOne({
          limit: 1,
          order: [ [ 'createdAt', 'DESC' ]],
        })

      if(!this_week) return res.status(404).send("No voting session for this week or any prior")
      if(!this_week.isActive()) return res.status(404).send("No voting session")

      if(this_week.isExpired() && !req.path.includes("/weekly/winners")) return res.status(410).send("Voting has ended")
      res.locals.weekly = this_week;
    }else{
      // TODO: fix later dupe
      res.locals.votingSession = this_week;
      res.locals.weekly = this_week;
    }

  }
// retarded filtering for administrator only routes
  const protected_routes = [
    "/weekly",
    "/sounds/add",
    "/sounds/delete",
    "/sounds/all",
    "/sounds/rename",
    "/token"
  ]
  if( protected_routes.includes(req.path) && !token.administrator )
   return res.status(401).send("You have no permission for this")
   res.locals.token = token
  next()
})
  

module.exports = router;