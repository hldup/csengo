import Om from "./models/om"
import Session from "./models/sessions"
import User from "./models/users"
import Sound from './models/sound'
import Vote from "./models/votes"
const dbInit = async () => {
    await User.sync()
    await Session.sync()
    await Om.sync();
    await Sound.sync()
    await Vote.sync()
}

export default dbInit 



