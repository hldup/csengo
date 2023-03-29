import Om from "./models/om"
import Session from "./models/sessions"
import User from "./models/users"

const dbInit = async () => {
    await User.sync()
    await Session.sync()
    await Om.sync()
}

export default dbInit 



