//connect to mysql database
// import mysql from 'mysql2';
import { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT } from '../config/env.js';
import { Sequelize } from 'sequelize';

// Create a Sequelize instance
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'mysql',
    logging: false,
});

// Create a connection function
const connectDB = async () => {
    try {
        await sequelize.authenticate();

        // NOTE for development:
        // The following sync call will auto-create any missing tables based on the Sequelize models.
        // This is convenient while developing, but you usually want it DISABLED in production.
        //
        // To disable in production, either:
        // 1) Keep the if-condition below and make sure NODE_ENV=production on your server, OR
        // 2) Comment out / remove the sync block entirely before deploying.
        // if (process.env.NODE_ENV !== 'production') {
        //     await sequelize.sync(); // use sync({ alter: true }) if you want it to auto-update columns during dev
        // }

        console.log('MySQL Database connected successfully.');
        return sequelize;
    } catch (error) {
        console.error('Unable to connect to the MySQL database:', error);
        throw error;
    }
};

export default sequelize;
export { connectDB };