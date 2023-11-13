import express from "express";
import votingSession, { currentWeek } from "../models/weekly";
import { JsonWebTokenError, JwtPayload } from "jsonwebtoken";
import Token from "../models/token";
// no idea why i have to import it like this to work
const jwt = require("jsonwebtoken");
const router = express.Router();

let unprotected_paths = ["/register", "/login"];
router.use(async (req, res, next) => {

	// log request when done
	res.on("finish", () => {
		console.log(
			`${res.statusCode} | (${jwt.verify(
				req.cookies["Ptoken"],
				process.env.TOKEN_SECRET,
				(err: JsonWebTokenError, data: JwtPayload) => {
					return data;
				}
			)?.username || "someone"
			}) Request to ${req.path} from ${req.hostname} (${req.get(
				"user-agent"
			)}) | ${new Date()}`
		);
	});

	// if unproceted path is hit just continue.
	if (unprotected_paths.includes(req.path)) {
		return next();
	}

	// filtering out api request via a API key/token
	if (req.headers.authorization) {
		if (
			!(await Token.findOne({
				where: { key: req.headers.authorization.split(" ")[1] },
			}))
		)
			return res.status(400).send({
				error: "INVALID_KEY",
				message: "Your API key is invalid!"
			});
	}

	// filtering out cookie based requests	
	if (!req.headers.authorization) {

		// of no cookie, just return
		if (!req.session)
			return res.status(401).send({ error: "NO_AUTH", message: "You are not authenticated!" });

	}

	// Filtering here {in the middleware} instead of repeating this code 3x
	if (["/sounds/vote", "/sounds/devote", "/sounds", "/weekly/winners"].includes(
		req.path
	)
	) {
		// checking if there is a voting session happening as of now
		// if the api hit is asking for the weekly winners just get the last week's session
		let this_week = await currentWeek();

		console.log(new Date())
		if (!this_week?.isActive() && !req.path.includes("/weekly/winners"))
			return res
				.status(410)
				.send({
					error: "SESSION_ENDED",
					message: "The voting session has closed",
				});

		else {
			// TODO idk i forgor
			this_week = await votingSession.findOne({
				limit: 1,
				order: [["createdAt", "DESC"]],
			});

			if (!this_week)
				return res
					.status(404)
					.send({
						error: "NO_SESSIONS",
						message: "No voting sessions this week or any prior!",
					});
			res.locals.weekly = this_week;
		}
		res.locals.weekly = this_week;
		res.locals.votingSession = this_week;
	}

	// retarded filtering for administrator only routes
	const protected_routes = [
		"/weekly/",
		"/sounds/add",
		"/sounds/delete",
		"/sounds/all",
		"/sounds/rename",
		"/sounds/deletecheck",
		"/token",
		"/users/",
		"/users/all",
		"/users/delete"
	];
	if (!req.headers.authorization) {
		// @ts-ignore
		if (protected_routes.includes(req.path) && !req.session.administrator)
			return res.status(401).send({
				error: "INSUFFICIENT_PERM",
				message: "You do not have permission for this action!"
			});
	}
	next();
});

module.exports = router;
