import { DataTypes, Model } from "sequelize";
import connection from "../database";

interface omAttributes {
	id: number;
}
export interface omInput extends Required<omAttributes> {
	id: number;
}
export interface omOutput extends Required<omAttributes> {}

class Om extends Model<omAttributes, omInput> implements omAttributes {
	public id!: number;
}

Om.init(
	{
		id: {
			type: DataTypes.BIGINT,
			primaryKey: true,
		},
	},
	{
		timestamps: true,
		sequelize: connection,
		freezeTableName: true,
	}
);

export default Om;
