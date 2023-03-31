
import { DataTypes, Model } from 'sequelize'
import connection from '../database'

interface VoteAttributes {
  user: string; // uuidv4 of user the session belongs to
  sound: string, //64bit seesiontoken
}
export interface VoteInput extends Required<VoteAttributes> { user: string }
export interface VoteOutput extends Required<VoteAttributes> {}

class Vote extends Model<VoteAttributes, VoteOutput> implements VoteAttributes {
    public  user!: string
    public sound!: string
  };
  Vote.init({
    user: {
        type: DataTypes.UUIDV4,
        primaryKey: true,
    },
    sound: {
        type: DataTypes.UUIDV4
    }
  },
  {
    timestamps: true,
    sequelize: connection,
    freezeTableName: true,
  });



export default Vote;