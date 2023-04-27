
import {  Sequelize } from 'sequelize'


const connection = new Sequelize({
    storage: './database.sqlite',
    dialect: 'sqlite',
    logging: false,
})

export default connection