import express, { Request, Response } from "express";
import Token from "../models/token";
import { random } from "..";
const router = express.Router();

router.post("/create", async (req: Request, res: Response) => {
	await Token.create({ key: random(64) });
	res.send("Created token");
});

router.post("/delete", async (req: Request, res: Response) => {
	if (!req.query.id) return res.status(400).send("No key id is given!");
	if (!(await Token.findOne({ where: { id: req.query.id as string } })))
		return res.status(404).send("No token under that id");
	await Token.destroy({ where: { id: req.query.id as string } });
	res.send("Deleted token");
});

router.get("/", async (req: Request, res: Response) => {
	const tokens = await Token.findAll({
		attributes: ["id", "key", "createdAt"],
	});
	if (tokens.length == 0) return res.status(404).send("No token");
	res.send(tokens);
});

module.exports = router;
