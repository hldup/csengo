import Om from "./models/om";
import User from "./models/users";
import Sound from "./models/sound";
import Vote from "./models/votes";
import Weekly from "./models/weekly";
import Token from "./models/token";
import Submit from "./models/submit";
const dbInit = async () => {
	await User.sync();
	await Om.sync();
	await Sound.sync();
	await Vote.sync();
	await Weekly.sync();
	await Token.sync();
	await Submit.sync();
};

export default dbInit;
