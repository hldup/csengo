
import { DataTypes, Model } from 'sequelize'
import connection from '../database'

interface VoteAttributes {
  user: string; 
  sound: string, 
  week: number, 
  year: number, 

}
export interface VoteInput extends Required<VoteAttributes> { user: string }
export interface VoteOutput extends Required<VoteAttributes> {}

class Vote extends Model<VoteAttributes, VoteOutput> implements VoteAttributes {
    public  user!: string
    public sound!: string
    public week!: number
    public year!: number
  };
  Vote.init({
    user: {
        type: DataTypes.UUIDV4,
    },
    sound: {
        type: DataTypes.UUIDV4
    },
    week: {
      type: DataTypes.BIGINT,
    },
    year: {
      type: DataTypes.BIGINT
    }
  },
  {
    timestamps: true,
    sequelize: connection,
    freezeTableName: true,
  });



export default Vote;