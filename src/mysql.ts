import mysql from "mysql2/promise";
import { config, validateConfig } from "./config.js";

validateConfig();

export const pool = mysql.createPool({
    host: config.mysql.host,
    port: config.mysql.port,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    waitForConnections: true,
    connectionLimit: 5,
    namedPlaceholders: true,
    multipleStatements: config.mysql.multipleStatements
});
