import { DataTypes, Model, Op, Optional } from "sequelize";
import connection from "../database";
import votingSession from "./weekly";

interface SoundAttributes {
	id: string;
	name: string;
	path: string;
	votes: number;
}
export interface SoundInput
	extends Optional<SoundAttributes, "name" | "path" | "votes" | "id"> {}
export interface SoundOutput extends Required<SoundAttributes> {}

class Sound
	extends Model<SoundAttributes, SoundInput>
	implements SoundAttributes
{
	public id!: string;
	public name!: string;
	public votes!: number;
	public path!: string;
	public deletable!: boolean;


	async isDeletable(){
		const candelete: votingSession = await votingSession.findOne({
			// @ts-ignore
			where: {
				sounds: { [Op.contains]: [this.id] },
			},
		});

		if(!candelete) return  true;
		return false;
	}
}

Sound.init(
	{
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
			defaultValue: 0,
		},
		path: {
			type: DataTypes.STRING,
		},
	},

	{
		timestamps: true,
		sequelize: connection,
		freezeTableName: true,
	}
);

export default Sound;
