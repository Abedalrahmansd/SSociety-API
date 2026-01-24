import { config } from 'dotenv';

config({path: `.env.${process.env.NODE_ENV || 'development'}.local`});

export const { PORT, DB_NAME, DB_PASSWORD, DB_HOST, DB_USER, DB_PORT, JWT_SECRET, JWT_EXPIRES_IN } = process.env;