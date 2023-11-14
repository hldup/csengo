import express, { Request, Response } from "express";
import { checkSchema, validationResult } from "express-validator";
import Sound from "../models/sound";
import votingSession, { currentWeek } from "../models/weekly";
import Vote from "../models/votes";
import { Op } from "sequelize";
import dayjs from "dayjs";
const router = express.Router();

router.post(
	"/new",
	checkSchema({
		sounds: {
			exists: true,
			isArray: true,
		},
		"sounds.*": {
			isString: true,
			isUUID: true,
		},
		start: {
			exists: true,
			isISO8601: true,
		},
		end: { exists: true, isISO8601: true },
	}),
	async (req: Request, res: Response) => {
		if (new Date(req.body.start) > new Date(req.body.end))
			return res
				.status(400)
				.send({
					error: "INVALID_DATE",
					message: "Start date cannot be after end date!",
				});

		// error handeling for headers/formdata
		const errors = validationResult(req);
		if (!errors.isEmpty())
			return res.status(400).json({
				error: "INVALID_FORM",
				message: "Field given are invalid/misformed",
				errors: errors.array(),
			});

		// checking if sounds exist
		for (let id of req.body.sounds) {
			if (!(await Sound.findOne({ where: { id: id } })))
				return res.status(400).send();
		}

		if (
			await votingSession.findOne({
				where: {
					start: { [Op.lte]: req.body.start },
					end: { [Op.gte]: req.body.end },
				},
			})
		)
			return res
				.status(409)
				.send(
					"There is already a voting declared for that week, maybe edit it istead!"
				);

		await votingSession.create({
			sounds: req.body.sounds,
			start: req.body.start,
			end: req.body.end,
		});

		for (let sound of req.body.sounds) {
			await Vote.destroy({ where: { sound: sound } });
			sound = await Sound.findOne({ where: { id: sound as string } });
		}

		res.send("Created the voting session");
	}
);

router.post(
	"/edit",
	checkSchema({
		sounds: {
			exists: true,
			isArray: true,
		},
		"sounds.*": {
			isString: true,
			isUUID: true,
		},
		start: {
			exists: true,
			isISO8601: true,
		},
		end: {
			exists: true,
			isISO8601: true,
		},
		id: {
			in: "query",
			exists: true,
			isUUID: true,
		},
	}),
	async (req: Request, res: Response) => {
		// error handeling for headers/formdata
		const errors = validationResult(req);
		if (!errors.isEmpty())
			return res.status(400).json({ errors: errors.array() });

		// checking if a Vsession exists i
		if (
			!(await votingSession.findOne({ where: { id: req.query.id as string } }))
		)
			return res.status(404).send("There isn't a voting session under this id");

		// checking if sounds exist
		for (let id of req.body.sounds) {
			if (!(await Sound.findOne({ where: { id: id } })))
				return res.status(400).send(" a sound given in a list does not exist");
		}

		await votingSession.update(
			{
				sounds: req.body.sounds,
				start: req.body.start as string,
				end: req.body.end as string,
			},
			{ where: { id: req.query.id as string } }
		);
			new Date("2023").toLocaleDateString("hu-Hu",{
				second: '2-digit',
				hour: 'numeric',
				minute: 'numeric'
			})
		res.send("Voting session edited");
	}
);

router.post(
	"/delete",
	checkSchema({
		id: {
			in: "query",
			exists: true,
			isUUID: true,
		},
	}),
	async (req: Request, res: Response) => {
		// error handeling for headers/formdata
		const errors = validationResult(req);
		if (!errors.isEmpty())
			return res.status(400).json({ errors: errors.array() });

		// checking if a Vsession exists
		if (
			!(await votingSession.findOne({ where: { id: req.query.id as string } }))
		)
			return res
				.status(404)
				.send("No voting session can be found under that id ");

		await votingSession.destroy({ where: { id: req.query.id as string } });
		res.send("Voting session deleted");
	}
);

router.get("/", async (req: Request, res: Response) => {
	let sessions = await votingSession.findAll({
		attributes: ["id", "sounds", "start", "end"],
	});

	if (!sessions || sessions.length == 0)
		return res.status(404).send("There are no voting sessions!");

	for (let sess of sessions) {
		let sounds = [];
		for (let sound of sess.sounds) {
			const dbsound = await Sound.findOne({
				where: { id: sound as string },
				attributes: ["id", "name", "createdAt"],
			});
			// @ts-ignore
			dbsound?.votes = await (
				await Vote.findAndCountAll({
					where: {
						sound: sound as string,
						session: sess.id,
					},
				})
			).count;
			// @ts-ignore
			sounds.push(dbsound);
		}
		// @ts-ignore
		sess.sounds = sounds;
	}

	res.send(sessions.reverse());
});

router.get("/winners", async (req: Request, res: Response) => {

	const winners =   await currentWeek()
	if(!winners) return res.send("No winners")

	let sound = await Sound.findOne({
		where: {
			id: winners.sounds[0]
		}
	})

	res.send({
		sounds: sound
	});
});

module.exports = router;
