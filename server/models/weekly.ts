
import { DataTypes, Model, Optional } from 'sequelize'
import connection from '../database'

interface weeklyAttributes {
  id: number;
  
  start: string,
  end: string,

  sounds: string,
  closed: boolean,
  
  current_week: boolean
}
export interface weeklyInput extends Optional<weeklyAttributes, "current_week" | "closed" | "id" | "start" | "end" | "sounds" > { start: string, end: string, sounds: string }
export interface weeklyOutput extends Required<weeklyAttributes> {}

class Weekly extends Model<weeklyAttributes, weeklyInput> implements weeklyAttributes {
    public  id!: number
    public start!: string
    public end!: string
    public sounds!: string
    public closed!: boolean
    public current_week!: boolean;
};
  
  Weekly.init({
    id: {
        type: DataTypes.UUIDV4,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      start: {
        type: DataTypes.DATE,
        allowNull: false,
      },
       end: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      sounds: {
        type: DataTypes.JSON,
        allowNull: false
      },
      closed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      current_week: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      }
  },
  {
    timestamps: true,
    sequelize: connection,
    freezeTableName: true,
  });



export default Weekly