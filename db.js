import { createPool } from "mysql2/promise";
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'huvert';
const DB_PASSWORD = process.env.DB_PASSWORD || 'huvert01';
const DB_NAME = process.env.DB_NAME || 'linkit';
const DB_PORT = process.env.DB_PORT || 3306;
export const conn = createPool({
    user: DB_USER,
    password: 'huvert01',
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME
});