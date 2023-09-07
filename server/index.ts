/*
Class/models imports
*/
import dbInit from "./init";
import User from "./models/users";

/*
Application imports
*/
import express, { Express } from "express";
import fs from "fs";
import crypto from "crypto";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import connection from "./database";
import { exit } from "process";
require("dotenv").config();

export const random = (len: number): string => {
	let options =
		"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$";
	const token = Array.from(crypto.getRandomValues(new Uint32Array(len)))
		.map(x => options[(x as number) % options.length])
		.join("");
	return token;
};

/*
	Creating app
*/
const app: Express = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
// dotENV
const port = process.env.PORT;

// checking if db exits -> create one
(async () => {
	try {
		await connection.authenticate();
		console.log("Connection has been established successfully.");
	} catch (error) {
		console.error("Unable to connect to the database:", error);
		exit();
	}
	await dbInit();

	// if no administrator account is available
	if (!(await User.findOne({ where: { administrator: true } }))) {
		const password = random(64);
		console.log("!!! ADMIN PASSWORD: ", password);
		await User.create({
			administrator: true,
			password: await bcrypt.hash(password, await bcrypt.genSalt(10)),
			username: "admin",
			om: 99999999,
		});
	}

	if (!fs.existsSync("./data/sounds")) {
		fs.mkdirSync("./data/sounds", { recursive: true });
	}
})();

app.set('trust proxy', 1) // trust first proxy
app.use(require("./middleware/session.middleware"));
// middleware for protected (admin) routes
app.use(require("./middleware/protected"));
//session management

app.use("/sounds/", require("./routes/sounds.route"));

app.use("/weekly", require("./routes/weekly.route"));

app.use("/", require("./routes/auth.route"));

app.use("/token", require("./routes/token.route"));

app.use("/users", require("./routes/user.route"));

app.listen(port, () => {
	console.log(`Listening on ${port}`);
});
