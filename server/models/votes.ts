import { DataTypes, Model } from "sequelize";
import connection from "../database";

interface VoteAttributes {
	user: string;
	sound: string;
	session: string;
}
export interface VoteInput extends Required<VoteAttributes> {
	user: string;
}
export interface VoteOutput extends Required<VoteAttributes> {}

class Vote extends Model<VoteAttributes, VoteOutput> implements VoteAttributes {
	public user!: string;
	public sound!: string;
	public session!: string;
}
Vote.init(
	{
		user: {
			type: DataTypes.UUID,
		},
		sound: {
			type: DataTypes.UUID,
		},
		session: {
			type: DataTypes.UUID,
		},
	},
	{
		timestamps: true,
		sequelize: connection,
		freezeTableName: true,
	}
);

export default Vote;
