
import { DataTypes, Model, Optional } from 'sequelize'
import connection from '../database'

interface votingSessionAttributes {
  id: number;
  sounds: string, // ["8bdb3bc5-52c2-4b54-abad-4ec8a711e9ad"]
  week: number, // 15
  year: number, // 2023
}
export interface votingSessionInput extends Optional<votingSessionAttributes, 
"id" | "sounds" | "week" | "year"  > { week: number, year: number, sounds: string }
export interface votingSesisonOutput extends Required<votingSessionAttributes> {}

class votingSession extends Model<votingSessionAttributes, votingSessionInput> implements votingSessionAttributes {
    public  id!: number
    public sounds!: string 
    public week!: number
    public year!: number
};
  
  votingSession.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      sounds: {
        type: DataTypes.JSONB,
        allowNull: false
      },
      week: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      year: {
        type: DataTypes.BIGINT,
        allowNull: false
      }
  },
  {
    timestamps: true,
    sequelize: connection,
    freezeTableName: true,
  });



export default votingSession