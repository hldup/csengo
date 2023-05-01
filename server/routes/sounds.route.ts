import express, { Request,  Response } from 'express';
import { checkSchema, validationResult } from 'express-validator';
import multer from 'multer';
import User from '../models/users';
import Sound from '../models/sound';
import Vote from '../models/votes';
import dayjs from 'dayjs';
import crypto  from "crypto";
import weekofyear from "dayjs/plugin/weekOfYear";
dayjs.extend(weekofyear)

function random(len: number): string {
  let options = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$'
  const token = Array.from(crypto.getRandomValues(new Uint32Array(len)))
    .map((x) => options[x as number % options.length])
    .join('')
  return token
}

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
const router = express.Router();


// CREATE sounds //
router.post('/add',
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

router.get('/',

  async (req: Request, res: Response) => {
    // @ts-ignore
    let sounds = []
    
    // @ts-ignore
    for(let sound of res.locals.votingSession?.sounds ){  
      let dbrecord = await Sound.findOne({
      attributes: ["id","name"],
        where: {id: sound}
       })   
       if (dbrecord) {
        // @ts-ignore
        dbrecord.dataValues.votes = (await Vote.findAndCountAll({where:{sound: sound}})).count
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
      user_votes: user_votes,
      week: dayjs(Date.now()).week()
    })
} )

router.get('/all',
  async (req: Request, res: Response) => {
    
    // @ts-ignore
    let sounds= await Sound.findAll({ attributes: ["id","name"] })
    if(sounds.length == 0) return res.sendStatus(404);

    res.send(sounds)
} )

router.post('/delete',
  async (req: Request, res: Response) => {
    if(!req.query.id) return res.status(400).send("id is missing from query")

    let sound = await Sound.findOne({where:{id: req.query.id as string }})
    if(!sound) return res.status(404).send("No sound under  that id")
    
    // destroying all votes
    await Vote.destroy({where:{sound: sound.id}})
    await sound.destroy()

    res.send()
} )


router.post('/vote',
  checkSchema({
    week: {
      in: ['query'],
      exists: true,
      isNumeric: true,
    },
    year: {
      in: ['query'],
      exists: true,
      isNumeric: true,
    },
    id: {
      in: ['query'],
      isString: true,
      notEmpty: true,
      isUUID: true, 
    },
     
  }),
async (req: Request, res: Response) => {    
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    // in case user has already voted reject
    const vote = await Vote.findOne({where: {user: res.locals.token.id, sound: req.query.id as string, year: req.query.year as string, week: req.query.week as string }});
    if(vote) return res.status(201).send("You have already voted for this")
    let sound = await Sound.findOne({ where:{id: req.query.id as string}})
    if(!sound) return res.status(404).send("No sound is found under that id");

    await Vote.create({
      user: res.locals.token.id,
      sound: sound.id,
      year: parseInt(req.query.year as string),
      week: parseInt(req.query.week as string),
     })

     res.sendStatus(200)
} )

router.post('/devote',
   checkSchema({
    week: {
      in: ['query'],
      exists: true,
      isNumeric: true,
    },
    year: {
      in: ['query'],
      exists: true,
      isNumeric: true,
    },
    id: {
      in: ['query'],
      isString: true,
      notEmpty: true,
      isUUID: true, 
    },
     
  }), async (req: Request, res: Response) => {    
     const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    // in case user has already voted reject
    const vote = await Vote.findOne({where: {user: res.locals.token.id, sound: req.query.id as string, year: req.query.year as string, week: req.query.week as string }});
    if(!vote) return res.status(404).send("You have not voted for this!")
    
    // checking if sound exists which is pretty retarded but who cares
    let sound = await Sound.findOne({ where:{id: req.query.id as string}})
    if(!sound) return res.status(404).send("No sound is found under that id");
    
    await Vote.destroy({
      where: {
        user: res.locals.token.id,
        sound: sound?.id,
        week: parseInt( req.query.week as string),
        year: parseInt( req.query.year as string),
       }})

    res.sendStatus(200)
} )

router.get('/:id',
  async (req: Request, res: Response) => {    
    if(!req.params.id) return res.sendStatus(400);

    let sound = await Sound.findOne({where:{ id: req.params.id }});
    if(!sound) return res.sendStatus(404);

    res.sendFile(`/data/sounds/${sound.path}`, {root: __dirname })
} )






module.exports = router;