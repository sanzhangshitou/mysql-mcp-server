import "dotenv/config";

export const config = {
    mysql: {
        host: process.env.MYSQL_HOST ?? "127.0.0.1",
        port: Number(process.env.MYSQL_PORT ?? "3306"),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        multipleStatements:
            (process.env.MYSQL_MULTIPLE_STATEMENTS ?? "false").toLowerCase() === "true"
    },

    allowWrite: (process.env.ALLOW_WRITE ?? "false").toLowerCase() === "true"
};

export function validateConfig() {
    if (!config.mysql.user || !config.mysql.password || !config.mysql.database) {
        throw new Error("Missing required env: MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE");
    }
}
