
import { DataTypes, Model, Optional } from 'sequelize'
import connection from '../database'

interface votingSessionAttributes {
  id: number;
  sounds: string, // ["8bdb3bc5-52c2-4b54-abad-4ec8a711e9ad"]
  start: string, // 1 = first day of the week
  end: string, // end 2= second day of the week
}
export interface votingSessionInput extends Optional<votingSessionAttributes, 
"id" | "sounds" | "start" | "end"  > { 
   sounds: string, start: string, end: string
}
export interface votingSesisonOutput extends Required<votingSessionAttributes> {}

class votingSession extends Model<votingSessionAttributes, votingSessionInput> implements votingSessionAttributes {
    public  id!: number
    public sounds!: string 

    public start!: string
    public end!: string
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
      start: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end: {
        type: DataTypes.DATE,
        allowNull: false
      }

    },
  {
    timestamps: true,
    sequelize: connection,
    freezeTableName: true,
  });



export default votingSession