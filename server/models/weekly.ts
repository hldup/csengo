
import { DataTypes, Model, Op, Optional } from 'sequelize'
import connection from '../database'
import Sound from './sound';

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

class votingSession extends Model<votingSessionAttributes, votingSessionInput>  {
    public  id!: number
    public sounds!: string 
    public start!: string
    public end!: string

    public topfive!: object

    isExpired(): boolean{
      console.log(new Date(this.end) < new Date());
      if(new Date(this.end) < new Date()) return true
      return false;
    };

    async getWinners( amount: number): Promise<object> {
      return await Sound.findAll({
        limit: amount,
        order:[
          ['votes', 'desc']
        ],
        attributes: ["id","votes","name"]
      });
    };
    isActive(): boolean {
      const now = new Date();
      if(
        new Date(this.start) < now  &&
        new Date(this.end) > now
        ) return true;
      return false;
    };





};
 
  export async function  currentWeek() {
    let week = await votingSession.findOne({where:{
      start:{ [Op.lte]: new Date() },
      end: { [Op.gte]: new Date() },
    }})
    if(week) return week;
    return null;
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