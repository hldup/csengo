import express, { Request, Response } from "express";
import User from "../models/users";
const router = express.Router();

// TODO: maybe add page based stuff so it doesn't send much data at 1time
router.get("/all", async (req: Request, res: Response) => {
	return res.send(
		await User.findAll({ attributes: ["id", "username", "om", "createdAt"] })
	);
});

router.post("/delete", async (req: Request, res: Response) => {
	if (!req.query.id) return res.status(400).send("No id for user");

	const user = await User.findOne({ where: { id: req.query.id as string } });
	if (!user) return res.status(404).send("No user under that id");
	if (user.administrator)
		return res.status(403).send("Can't delete an administrator!");
	await User.destroy({ where: { id: req.query.id as string } });
	return res.send("User deleted");
});

module.exports = router;
