import express, { Request, Response } from "express";
import { checkSchema, validationResult } from "express-validator";
import multer from "multer";
import Sound from "../models/sound";
import Vote from "../models/votes";
import dayjs from "dayjs";
import crypto from "crypto";
import weekofyear from "dayjs/plugin/weekOfYear";
import path from "path";
import votingSession, { currentWeek } from "../models/weekly";
import { Op } from "sequelize";
dayjs.extend(weekofyear);

function random(len: number): string {
	let options =
		"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$";
	const token = Array.from(crypto.getRandomValues(new Uint32Array(len)))
		.map(x => options[(x as number) % options.length])
		.join("");
	return token;
}

const storage = multer.diskStorage({
	// @ts-ignore
	destination: function (req, file, cb) {
		cb(null, "././data/sounds");
	},
	// @ts-ignore
	filename: function (req, file, cb) {
		cb(null, random(64) + ".mp3");
	},
});
const upload = multer({ storage: storage });
const router = express.Router();

// CREATE sounds //
router.post(
	"/add",
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
		if (!errors.isEmpty())
			return res.status(400).json({ errors: errors.array() });

		// @ts-ignore
		if (req.file?.mimetype != "audio/mpeg") {
			res.statusCode = 400;
			return res.send("File not audio");
		}
		// @ts-ignore
		let filename = req.file?.filename;
		Sound.create({
			path: filename,
			name: req.body.name,
		});
		res.sendStatus(200);
	}
);

router.get(
	"/",

	async (req: Request, res: Response) => {
		// @ts-ignore
		let sounds = [];
		// @ts-ignore
		for (let sound of res.locals.votingSession?.sounds) {
			let dbrecord = await Sound.findOne({
				attributes: ["id", "name"],
				where: { id: sound },
			});
			if (dbrecord) {
				// @ts-ignore
				dbrecord.dataValues.votes = (
					await Vote.findAndCountAll({ where: { sound: sound } })
				).count;
				sounds.push(dbrecord);
			}
		}

		// maybe add filtering for only this weeks vote
		const user_votes = await Vote.findAll({
			// @ts-ignore
			where: { user: req.session.userId },
			attributes: ["sound"],
		}).then(data => {
			let raw: string[] = [];
			for (let sound of data) {
				raw.push(sound.dataValues.sound);
			}
			return raw;
		});

		res.send({
			// @ts-ignore
			sounds: sounds,
			user_votes: user_votes,
			end: res.locals.votingSession.end,
		});
	}
);

router.get("/all", async (req: Request, res: Response) => {
	// @ts-ignore"
	let sounds = await Sound.findAll({
		attributes: ["id", "name", "createdAt", "votes"],
	});
	if (sounds.length == 0) return res.sendStatus(404);
	
	res.send(sounds);
});

router.post("/delete", async (req: Request, res: Response) => {
	if (!req.query.id) return res.status(400).send("id is missing from query");

	// if sound is in a voting session reject
	if (
		await votingSession.findOne({
			// @ts-ignore
			where: {
				sounds: { [Op.contains]: [req.query.id as string] },
			},
		})
	)
		return res.status(403).send("This sound is in a voting session!");

	let sound = await Sound.findOne({ where: { id: req.query.id as string } });
	if (!sound) return res.status(404).send("No sound under  that id");

	// destroying all votes & sound
	await Vote.destroy({ where: { sound: sound.id } });
	await sound.destroy();

	res.send("Deleted");
});

router.post(
	"/vote",
	checkSchema({
		id: {
			in: ["query"],
			isString: true,
			notEmpty: true,
			isUUID: true,
		},
	}),
	async (req: Request, res: Response) => {
		const errors = validationResult(req);
		if (!errors.isEmpty())
			return res.status(400).json({ errors: errors.array() });

		if (!res.locals.votingSession.sounds.includes(req.query.id))
			return res.status(401).send("You cannot vote for this!");

		// in case user has already voted reject
		const vote = await Vote.findOne({
			where: {
				// @ts-ignore
				user: req.session.userId,
				sound: req.query.id as string,
				session: res.locals.votingSession.id,
			},
		});

		if (vote) return res.status(201).send("You have already voted for this");
		let sound = await Sound.findOne({ where: { id: req.query.id as string } });
		if (!sound) return res.status(404).send("No sound is found under that id");

		await Vote.create({
				// @ts-ignore
			user: req.session.userId,
			sound: sound.id,
			session: res.locals.votingSession.id,
		});

		await Sound.update({ votes: (sound.votes + 1) }, { where: { id: sound.id } });
		res.sendStatus(200);
	}
);

// TODO: implement that you can only vote if the sound is a in the CURRENT voting session
router.post(
	"/devote",
	checkSchema({
		id: {
			in: ["query"],
			isString: true,
			notEmpty: true,
			isUUID: true,
		},
	}),
	async (req: Request, res: Response) => {
		const errors = validationResult(req);
		if (!errors.isEmpty())
			return res.status(400).json({ errors: errors.array() });

		if (!res.locals.votingSession.sounds.includes(req.query.id))
			return res.status(401).send("You cannot vote for this!");
		// in case user has already voted reject
		const vote = await Vote.findOne({
			where: {
				// @ts-ignore
				user: req.session.userId,
				sound: req.query.id as string,
				session: res.locals.votingSession.id,
			},
		});

		if (!vote) return res.status(404).send("You have not voted for this!");

		// checking if sound exists which is pretty retarded but who cares
		let sound = await Sound.findOne({ where: { id: req.query.id as string } });
		if (!sound) return res.status(404).send("No sound is found under that id");

		await Vote.destroy({
			where: {
				// @ts-ignore
				user: req.session.userId,
				sound: sound?.id,
				session: res.locals.votingSession.id,
			},
		});

		await Sound.update({ votes: (sound.votes - 1) }, { where: { id: sound.id } });
		res.sendStatus(200);
	}
);

router.get("/:id", async (req: Request, res: Response) => {
	if (!req.params.id) return res.sendStatus(400);

	let sound = await Sound.findOne({ where: { id: req.params.id } });
	if (!sound) return res.sendStatus(404);

	res.sendFile(path.join(__dirname, "../data/sounds", sound.path));
});

router.post(
	"/rename",
	checkSchema({
		name: {
			isString: true,
			exists: true,
		},
	}),
	async (req: Request, res: Response) => {
		if (!req.query.id) return res.sendStatus(400);

		if (!(await Sound.findOne({ where: { id: req.query.id as string } })))
			return res.sendStatus(404);

		await Sound.update(
			{ name: req.body.name },
			{ where: { id: req.query.id as string } }
		);

		res.send("Renamed");
	}
);

// check if sound can be deleted
router.get(
	"/deletecheck",
	checkSchema({
		id: {
			in: ['query'],
			isString: true,
			exists: true,
			isUUID: true,
		},
	}),
	async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty())
			return res.status(400).json({ errors: errors.array() });

		console.log(req.query)
	// if sound is in a voting session reject
	if (
		await votingSession.findOne({
			// @ts-ignore
			where: {
				sounds: { [Op.contains]: [req.query.id as string] },
			},
		})
		)
		return res.send(false);

		res.send(true);
	}
);

module.exports = router;
