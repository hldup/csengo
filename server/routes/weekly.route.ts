import express, { Request,  Response } from 'express';
import { checkSchema, validationResult } from 'express-validator';
import Sound from '../models/sound';
import votingSession from '../models/weekly';
import Vote from '../models/votes';
const router = express.Router();


router.post('/new',
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
    });

    for(let sound of req.body.sounds ){
      await Vote.destroy({where: {sound: sound}})
      sound = await Sound.findOne({where: {id: sound as string }})
    };
    
    res.send("Created the voting session")
} )

router.post('/edit',
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

    // checking if a Vsession exists i
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

router.post('/delete',
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


router.get('/',
  async (req: Request, res: Response) => {    
    
    let sessions = await votingSession.findAll({
      attributes: ["id","sounds","week","year"]
    })

    if(!sessions || sessions.length == 0) return res.status(404).send("Ther are no voting sessions!")
    
    for(let sess of sessions ){
      let sounds = []

      for(let sound of sess.sounds){
          const dbsound = await Sound.findOne({
            where:{id: sound as string},
            attributes: ["id","name","createdAt"]
          });

          // @ts-ignore
          dbsound?.votes = await (await Vote.findAndCountAll({where:{sound: sound as string, week:sess.week, year: sess.year }})).count

          // @ts-ignore
          sounds.push(dbsound)
      }
      // @ts-ignore
      sess.sounds = sounds;
    }
    
    res.send(sessions.reverse());

} )

module.exports = router;