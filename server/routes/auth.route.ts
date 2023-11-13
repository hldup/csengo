import express, { Request, Response } from "express";
import { checkSchema, validationResult } from "express-validator";
import axios from "axios";
import bcrypt from "bcrypt";
import User from "../models/users";
import Om from "../models/om";
const router = express.Router();
router.post(
	"/healthcheck",
	async (req: Request, res: Response) => {
		return res.send("Ok")
	});

// TODO add root path
router.post(
	"/",
	async (req: Request, res: Response) => {
		return res.send("Szia :)")
	});


router.post(
	"/login",
	checkSchema({
		username: {
			in: ["body"],
			isString: true,
			notEmpty: true,
		},
		password: {
			in: ["body"],
			isString: true,
			notEmpty: true,
		},
		hcaptchaKey: {
			isString: true,
			in: ["body"],
			notEmpty: true,
		},
	}),
	async (req: Request, res: Response) => {
		// error handeling for headers/formdata
		const errors = validationResult(req);
		if (!errors.isEmpty())
			return res.status(400).json({ errors: errors.array() });

		if (!process.env.DEV) {
			// // hcaptcha key validation
			let response = await axios({
				method: "GET",
				url: "https://hcaptcha.com/siteverify",
				params: {
					response: req.body.hcaptchaKey,
					secret: process.env.HCAPTCHA_SECRET as string,
				},
			});
			if (!response.data.success) return res.sendStatus(401);
		}

		// cache useragent/ip and check if the requests sent in the past 10 minutes is less then 10
		let user = await User.findOne({ where: { username: req.body.username } });
		if (!user) return res.sendStatus(401); // in case no user with username exits

		// if hashed pass dont match
		if (!(await bcrypt.compare(req.body.password, user.password)))
			return res.status(401).send();

		//@ts-ignore retarded js
		req.session.userId = user.id,
		//@ts-ignore retarded js
		req.session.administrator = user.administrator,


			res.sendStatus(200);
	}
);

router.post(
	"/register",
	checkSchema({
		username: {
			isString: true,
			notEmpty: true,
			isLength: { options: { min: 3, max: 64 } },
			isAlphanumeric: true,
		},
		password: {
			isString: true,
			notEmpty: true,
			isLength: { options: { min: 3, max: 64 } },
		},
		om: {
			isString: true,
			notEmpty: true,
			isNumeric: true,
		},
		hcaptchaKey: {
			isString: true,
			notEmpty: true,
		},
	}),
	async (req: Request, res: Response) => {
		// error handeling for headers/formdata
		const errors = validationResult(req);
		if (!errors.isEmpty())
			return res.status(400).json({ errors: errors.array() });

		if (process.env.DEV as string != "1") {
			// // hcaptcha key validation
			let response = await axios({
				method: "GET",
				url: "https://hcaptcha.com/siteverify",
				params: {
					response: req.body.hcaptchaKey,
					secret: process.env.HCAPTCHA_SECRET as string,
				},
			});
			if (!response.data.success) return res.sendStatus(401);

		}

		// if user already exists under username return
		if (await User.findOne({ where: { username: req.body.username } }))
			return res
				.status(403)
				.send(
					"Seems like someone has already registered under this information"
				);

		// if user already exists with this OM
		if (await User.findOne({ where: { om: req.body.om } }))
			return res
				.status(403)
				.send(
					"Seems like someone has already registered with this information"
				);

		// if the om id given by user is not in db return as 401
		if (!process.env.DEV && !(await Om.findOne({ where: { id: req.body.om } })))
			return res.status(401).send("OM invalid");

		// creating user in DB
		let user = await User.create({
			username: req.body.username,
			// hashing password to avoid bs later
			password: await bcrypt.hash(req.body.password, await bcrypt.genSalt(10)),
			om: req.body.om,
			administrator: false,
		});

		//@ts-ignore retarded js
		req.session["userId"] = user.id,
			//@ts-ignore retarded js
			req.session["administrator"] = user.administrator,
			//@ts-ignore  
			req.session["agent"] = req.get("user-agent"),


			res.sendStatus(200);
	}
);


module.exports = router;
