import express, { Request, Response } from "express";
import session from "express-session";
const router = express.Router();
import RedisStore from "connect-redis"
import {createClient} from "redis"
import { exit } from "process";

require("dotenv").config()

// Initialize client.
let redis_client = createClient({
  socket:{
    port:  parseInt( process.env.SESSION_STORE_PORT as string) || 6379 ,
    host: process.env.SESSION_STORE_HOST,
  },
  password: process.env.SESSION_STORE_PASSWORD as string,
});

redis_client.connect().catch((error) => {
  console.error(error);
  exit();
})

// @ts-ignore fuck off
let redisStore = new RedisStore({
  // @ts-ignore
  client: redis_client,
  prefix: "csengo:",
})

router.use(session({
  store: redisStore,
  name: 'Ptoken',
  secret: process.env.TOKEN_SECRET as string,
  resave: false,
  saveUninitialized: true,
  cookie: { 
    httpOnly: false,
    secure: false,
    path: "/",
    maxAge: 1_209_600_000, // 14 days
  }
}))

module.exports = router;
