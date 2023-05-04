import { DataTypes, Model, Optional } from 'sequelize'
import connection from '../database'

interface SoundAttributes {
  id: string;
  name: string,
  path: string,
  votes: number,
}
export interface SoundInput  extends Optional<SoundAttributes, "name" | "path" | "votes" | "id" > {}
export interface SoundOutput extends Required<SoundAttributes> {}

class Sound extends Model<SoundAttributes, SoundInput> implements SoundAttributes {
    public  id!: string
    public name!: string
    public votes!: number
    public path!: string
  };

  Sound.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
      },
      votes: {
        type: DataTypes.BIGINT,
        defaultValue: 0
      },
      path: {
            type: DataTypes.STRING,
          }
      },

  {
    timestamps: true,
    sequelize: connection,
    freezeTableName: true,
  }
  );



export default Sound