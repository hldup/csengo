import { DataTypes, Model, Optional } from "sequelize";
import connection from "../database";

interface TokenAttributes {
	id: string;
	key: string;
}

export interface TokenInput extends Optional<TokenAttributes, "key" | "id"> {
	key: string;
}

export interface TokenOutput extends Required<TokenAttributes> {}

class Token
	extends Model<TokenAttributes, TokenInput>
	implements TokenAttributes
{
	public id!: string;
	public key!: string;
}
Token.init(
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4,
		},
		key: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		timestamps: true,
		sequelize: connection,
		freezeTableName: true,
	}
);

export const create = async (payload: TokenInput): Promise<TokenOutput> => {
	const token = await Token.create(payload);
	return token;
};

export const revoke = async (data: TokenInput) => {
	await Token.destroy({ where: { id: data.id } });
};

export default Token;
