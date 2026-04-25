# MySQL MCP Server

[![npm version](https://img.shields.io/npm/v/@sanzhangshitou/mysql-mcp-server.svg)](https://www.npmjs.com/package/@sanzhangshitou/mysql-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MySQL MCP (Model Context Protocol) 服务器，为 AI 助手提供 MySQL 数据库操作能力。

## 功能

- 执行 SQL 命令（支持参数化查询）
- 写操作保护（默认禁止，可配置开启）
- 多语句支持（可配置）

## 安装

```bash
npm install @sanzhangshitou/mysql-mcp-server
```

## 配置

创建 `.env` 文件或设置环境变量：

```env
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=your_user
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=your_database

# 安全开关：默认禁止写操作
ALLOW_WRITE=false

# 多语句支持：默认禁用
MYSQL_MULTIPLE_STATEMENTS=false
```

**必需环境变量**：

| 变量 | 说明 |
|------|------|
| `MYSQL_USER` | 数据库用户名 |
| `MYSQL_PASSWORD` | 数据库密码 |
| `MYSQL_DATABASE` | 目标数据库 |

**可选环境变量**：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `MYSQL_HOST` | `127.0.0.1` | 数据库地址 |
| `MYSQL_PORT` | `3306` | 数据库端口 |
| `ALLOW_WRITE` | `false` | 是否允许写操作 |
| `MYSQL_MULTIPLE_STATEMENTS` | `false` | 是否允许多语句 |

## 使用

### 命令行

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 运行
npm run start

# 代码检查
npm run lint
npm run format
npm run check
```

### MCP 客户端配置

在 MCP 客户端（如 Claude Desktop）配置文件中添加：

```json
{
  "mcpServers": {
    "mysql": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "MYSQL_HOST": "127.0.0.1",
        "MYSQL_PORT": "3306",
        "MYSQL_USER": "your_user",
        "MYSQL_PASSWORD": "your_password",
        "MYSQL_DATABASE": "your_database",
        "ALLOW_WRITE": "false"
      }
    }
  }
}
```

或使用 npx：

```json
{
  "mcpServers": {
    "mysql": {
      "command": "npx",
      "args": ["@sanzhangshitou/mysql-mcp-server"],
      "env": {
        "MYSQL_USER": "your_user",
        "MYSQL_PASSWORD": "your_password",
        "MYSQL_DATABASE": "your_database"
      }
    }
  }
}
```

## MCP 工具

### mysql_execute

执行 MySQL SQL 命令。

**参数**：

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `sql` | string | 是 | SQL 命令 |
| `params` | array | 否 | 参数数组，如 `[1, "name"]` |

**示例**：

```json
{
  "sql": "SELECT * FROM users WHERE id = ?",
  "params": [1]
}
```

**返回格式**：

查询语句返回：

```json
{
  "command": "select",
  "sql": "SELECT * FROM users WHERE id = ?",
  "params": [1],
  "result": {
    "type": "rows",
    "rowCount": 1,
    "rows": [{ "id": 1, "name": "张三" }],
    "fields": [{ "name": "id", "columnType": 3 }]
  }
}
```

写操作返回（需 `ALLOW_WRITE=true`）：

```json
{
  "command": "insert",
  "sql": "INSERT INTO users (name) VALUES (?)",
  "params": ["李四"],
  "result": {
    "type": "result",
    "affectedRows": 1,
    "insertId": 2
  }
}
```

## 写操作限制

默认禁止以下 SQL 命令：

- 数据操作：`INSERT`, `UPDATE`, `DELETE`, `REPLACE`
- 结构操作：`CREATE`, `ALTER`, `DROP`, `TRUNCATE`
- 权限操作：`GRANT`, `REVOKE`
- 其他：`CALL`, `SET`, `LOAD`, `RENAME`, `LOCK`, `UNLOCK`
- 事务：`START`, `BEGIN`, `COMMIT`, `ROLLBACK`

设置 `ALLOW_WRITE=true` 可允许这些操作。

## 项目结构

```
src/
├── index.ts          # MCP 服务器入口
├── config.ts         # 配置管理
├── mysql.ts          # MySQL 连接池
├── sql.ts            # SQL 解析与命令检测
├── result.ts         # 结果格式化
└── tools/
    └── mysqlExecute.ts  # mysql_execute 工具实现
```

## 安全建议

1. 使用只读数据库用户连接
2. 保持 `ALLOW_WRITE=false`，仅在必要时开启
3. 不要在代码中硬编码数据库凭证
4. 生产环境使用专用数据库账户

## 相关链接

- [GitHub](https://github.com/sanzhangshitou/mysql-mcp-server)
- [npm](https://www.npmjs.com/package/@sanzhangshitou/mysql-mcp-server)
- [问题反馈](https://github.com/sanzhangshitou/mysql-mcp-server/issues)

## License

[MIT](https://github.com/sanzhangshitou/mysql-mcp-server/blob/master/LICENSE)