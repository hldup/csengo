import { DataTypes, Model } from "sequelize";
import connection from "../database";

interface submitAttributes {
    id: string;
    name: string;
    user: number;
    approved: boolean;
    path: string;

}
export interface submitInput extends Required<submitAttributes> {
    id: string;
    name: string;
    user: number;
    path: string;
}
export interface submitOutput extends Required<submitAttributes> { }

class Submit extends Model<submitAttributes, submitInput> implements submitAttributes {
    public id!: string;
    public name!: string;
    public user!: number;
    public path!: string;
    public approved!: boolean;
}

Submit.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        user: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        path: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        approved: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        }
    },
    {
        timestamps: true,
        sequelize: connection,
        freezeTableName: true,
    }
);

export default Submit;
