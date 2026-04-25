import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

import { config } from "../config.js";
import { pool } from "../mysql.js";
import { getSqlCommand, isWriteOrDangerousCommand } from "../sql.js";
import { formatMysqlResult, stringifyResult } from "../result.js";

export function registerMysqlExecuteTool(server: McpServer) {
    server.tool(
        "mysql_execute",
        "Execute a MySQL SQL command. Write commands require ALLOW_WRITE=true.",
        {
            sql: z.string().min(1).describe("SQL command to execute"),
            params: z
                .array(z.any())
                .optional()
                .describe("Optional positional parameters, for example [1, 'name']")
        },
        async ({ sql, params = [] }) => {
            try {
                const command = getSqlCommand(sql);
                const isWrite = isWriteOrDangerousCommand(sql);

                if (!config.allowWrite && isWrite) {
                    return {
                        isError: true,
                        content: [
                            {
                                type: "text",
                                text: stringifyResult({
                                    rejected: true,
                                    reason: "Write or dangerous SQL command rejected. Set ALLOW_WRITE=true to allow it.",
                                    command,
                                    sql
                                })
                            }
                        ]
                    };
                }

                const [rows, fields] = await pool.execute<
                    RowDataPacket[] | RowDataPacket[][] | ResultSetHeader | ResultSetHeader[]
                >(sql.trim(), params);

                return {
                    content: [
                        {
                            type: "text",
                            text: stringifyResult({
                                command,
                                sql: sql.trim(),
                                params,
                                result: formatMysqlResult(rows, fields)
                            })
                        }
                    ]
                };
            } catch (error) {
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: stringifyResult({
                                error: error instanceof Error ? error.message : String(error),
                                sql,
                                params
                            })
                        }
                    ]
                };
            }
        }
    );
}
