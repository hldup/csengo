
import { DataTypes, Model } from 'sequelize'
import connection from '../database'

interface SessionAttributes {
  user: string; // uuidv4 of user the session belongs to
  token: string, //64bit seesiontoken
  expires: number,
}
export interface SessionInput extends Required<SessionAttributes> { user: string }
export interface SessionOutput extends Required<SessionAttributes> {}

class Session extends Model<SessionAttributes, SessionOutput> implements SessionAttributes {
    public  user!: string
    public token!: string
    public expires!: number
  };
  Session.init({
    expires: {
        type: DataTypes.BIGINT,
      },
    user: {
        type: DataTypes.UUIDV4,
        primaryKey: true,
    },
    token: {
        type: DataTypes.STRING
    }
  },
  {
    timestamps: true,
    sequelize: connection,
    freezeTableName: true,
  });



export default Session