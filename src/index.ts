#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerMysqlExecuteTool } from "./tools/mysqlExecute.js";
import { isConfigValid } from "./config.js";
import { pool } from "./mysql.js";

const server = new McpServer({
    name: "mysql-mcp-server",
    version: "1.0.0"
});

registerMysqlExecuteTool(server);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);

    // 检测数据库连接状态
    if (!isConfigValid() || !pool) {
        console.error("[mysql-mcp-server] 启动成功，未连上数据库（缺少 MYSQL_USER / MYSQL_PASSWORD / MYSQL_DATABASE 环境变量）");
        return;
    }

    try {
        await pool.execute("SELECT 1");
        console.error("[mysql-mcp-server] 启动成功，已连上数据库");
    } catch {
        console.error("[mysql-mcp-server] 启动成功，未连上数据库（数据库连接失败，请检查配置）");
    }
}

main().catch(error => {
    console.error("[mysql-mcp-server] 未启动成功:", error instanceof Error ? error.message : error);
    process.exit(1);
});
