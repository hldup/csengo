import Om from "./models/om"
import User from "./models/users"
import Sound from './models/sound'
import Vote from "./models/votes"
import Weekly from "./models/weekly"
const dbInit = async () => {
    await User.sync()
    await Om.sync();
    await Sound.sync()
    await Vote.sync()
    await Weekly.sync()
}

export default dbInit 



