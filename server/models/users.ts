import { DataTypes, Model, Optional } from "sequelize";
import connection from "../database";

interface UserAttributes {
	id: string; // uuidv4 of user
	username: string; //username that end user logs in with
	password: string; // uncencrypted password
	om: number; // om number (public data)
	administrator: boolean;
}

export interface UserInput
	extends Optional<
		UserAttributes,
		"username" | "id" | "password" | "om" | "administrator"
	> {
	username: string;
}

export interface UserOutput extends Required<UserAttributes> { }

class User extends Model<UserAttributes, UserInput> implements UserAttributes {
	public id!: string;
	public username!: string;
	password!: string;
	public om!: number;
	public administrator!: boolean;
}
User.init(
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4,
		},
		username: {
			type: DataTypes.STRING,
			allowNull: false,
		},

		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		om: {
			type: DataTypes.BIGINT,
			allowNull: false,
		},
		administrator: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
	},
	{
		timestamps: true,
		sequelize: connection,
		freezeTableName: true,
	}
);

export const create = async (payload: UserInput): Promise<UserOutput> => {
	const user = await User.create(payload);
	return user;
};

export default User;
