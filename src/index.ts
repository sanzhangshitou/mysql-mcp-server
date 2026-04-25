#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerMysqlExecuteTool } from "./tools/mysqlExecute.js";

const server = new McpServer({
    name: "mysql-mcp-server",
    version: "1.0.0"
});

registerMysqlExecuteTool(server);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch(error => {
    console.error("Fatal error:", error);
    process.exit(1);
});
