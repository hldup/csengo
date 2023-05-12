import { Sequelize } from "sequelize";
require("dotenv").config();

const connection = new Sequelize(
	process.env.DB_NAME as string,
	process.env.DB_USER as string,
	process.env.DB_PASS as string,
	{
		host: process.env.DB_HOST as string,
		dialect: "postgres",
		logging: false,
	}
);

export default connection;
