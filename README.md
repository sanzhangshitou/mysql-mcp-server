# MySQL MCP Server

[![npm version](https://img.shields.io/npm/v/@sanzhangshitou/mysql-mcp-server.svg)](https://www.npmjs.com/package/@sanzhangshitou/mysql-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MySQL MCP (Model Context Protocol) 服务器，为 AI 助手提供 MySQL 数据库操作能力。通过 MCP 协议暴露 `mysql_execute` 工具，AI 模型可以直接执行 SQL 查询、读取表结构、进行数据操作。

## 特性

- **参数化查询**：支持 `?` 占位符参数，防止 SQL 注入
- **写操作保护**：默认禁止 INSERT / UPDATE / DELETE / DROP 等危险操作，需显式开启
- **多语句控制**：可配置是否允许多条 SQL 语句在一次调用中执行
- **连接池管理**：基于 `mysql2` 的连接池，高效复用数据库连接
- **结果格式化**：查询返回结构化 JSON（含字段信息），写操作返回影响行数、插入 ID 等

## 前置要求

- [Node.js](https://nodejs.org/) >= 22.0.0
- MySQL 5.7+ / MariaDB 10.2+

## 安装

### npm 全局安装

```bash
npm install -g @sanzhangshitou/mysql-mcp-server
```

### 项目本地安装

```bash
npm install @sanzhangshitou/mysql-mcp-server
```

### 从源码安装

```bash
git clone https://github.com/sanzhangshitou/mysql-mcp-server.git
cd mysql-mcp-server
npm install
npm run build
```

## 配置

### 环境变量

复制 `.env.example` 为 `.env` 并修改：

```bash
cp .env.example .env
```

| 变量 | 必填 | 默认值 | 说明 |
|------|:--:|--------|------|
| `MYSQL_HOST` | 否 | `127.0.0.1` | MySQL 服务器地址 |
| `MYSQL_PORT` | 否 | `3306` | MySQL 服务器端口 |
| `MYSQL_USER` | **是** | - | 数据库用户名 |
| `MYSQL_PASSWORD` | **是** | - | 数据库密码 |
| `MYSQL_DATABASE` | **是** | - | 目标数据库名称 |
| `ALLOW_WRITE` | 否 | `false` | 是否允许写操作（INSERT / UPDATE / DELETE / DROP 等）。设为 `true` 开启 |
| `MYSQL_MULTIPLE_STATEMENTS` | 否 | `false` | 是否允许一次执行多条 SQL（以 `;` 分隔）。设为 `true` 开启 |

> **提示**：`MYSQL_USER`、`MYSQL_PASSWORD`、`MYSQL_DATABASE` 三个变量缺一不可，缺少任何一个服务将启动但无法连接数据库。

### 安全开关说明

| 开关 | 默认值 | 开启后的行为 | 安全建议 |
|------|:------:|------|----------|
| `ALLOW_WRITE` | `false` | 允许 INSERT、UPDATE、DELETE、CREATE、ALTER、DROP、TRUNCATE、GRANT、REVOKE 等命令 | 生产环境务必保持 `false` |
| `MYSQL_MULTIPLE_STATEMENTS` | `false` | 允许一次调用执行多条 SQL 语句 | 保持 `false`，除非明确需要批量执行 |

## 使用

### 命令行

```bash
# 开发模式（直接运行 TypeScript）
npm run dev

# 编译为 JavaScript
npm run build

# 运行编译后的服务
npm run start

# 代码检查与格式化
npm run lint
npm run format
npm run check
```

### MCP 客户端配置

在 MCP 客户端（如 Claude Desktop、VS Code Copilot 等）的配置文件中添加：

**方式一：使用 node 直接运行**

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

**方式二：使用 npx（无需手动安装）**

```json
{
  "mcpServers": {
    "mysql": {
      "command": "npx",
      "args": ["@sanzhangshitou/mysql-mcp-server"],
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

## MCP 工具

### `mysql_execute`

执行 MySQL SQL 命令。写操作需要 `ALLOW_WRITE=true`。

**输入参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|:--:|------|
| `sql` | string | 是 | 待执行的 SQL 语句，支持 `?` 参数占位符 |
| `params` | array | 否 | SQL 参数数组，按位置绑定，如 `[1, "name"]` |

**调用示例**：

```json
{
  "sql": "SELECT * FROM users WHERE id = ?",
  "params": [1]
}
```

```json
{
  "sql": "INSERT INTO users (name, age) VALUES (?, ?)",
  "params": ["张三", 25]
}
```

**查询返回格式**：

```json
{
  "command": "select",
  "sql": "SELECT * FROM users WHERE id = ?",
  "params": [1],
  "result": {
    "type": "rows",
    "rowCount": 1,
    "rows": [{ "id": 1, "name": "张三" }],
    "fields": [
      { "name": "id", "columnType": 3 },
      { "name": "name", "columnType": 253 }
    ]
  }
}
```

**写操作返回格式**（需 `ALLOW_WRITE=true`）：

```json
{
  "command": "insert",
  "sql": "INSERT INTO users (name) VALUES (?)",
  "params": ["李四"],
  "result": {
    "type": "result",
    "affectedRows": 1,
    "insertId": 2,
    "changedRows": 0,
    "warningStatus": 0,
    "info": ""
  }
}
```

## 写操作限制

当 `ALLOW_WRITE=false`（默认）时，以下 SQL 命令将被拒绝执行：

| 类别 | 被拦截的命令 |
|------|-------------|
| 数据操作 | `INSERT`、`UPDATE`、`DELETE`、`REPLACE` |
| 结构变更 | `CREATE`、`ALTER`、`DROP`、`TRUNCATE` |
| 权限管理 | `GRANT`、`REVOKE` |
| 事务控制 | `START`、`BEGIN`、`COMMIT`、`ROLLBACK` |
| 其他 | `CALL`、`SET`、`LOAD`、`RENAME`、`LOCK`、`UNLOCK` |

设置 `ALLOW_WRITE=true` 可允许以上所有操作。

## 项目结构

```
mysql-mcp-server/
├── src/
│   ├── index.ts              # MCP 服务器入口（stdio 传输）
│   ├── config.ts             # 环境变量读取与配置验证
│   ├── mysql.ts              # MySQL 连接池初始化（mysql2）
│   ├── sql.ts                # SQL 解析与写命令检测
│   ├── result.ts             # 查询结果格式化
│   └── tools/
│       └── mysqlExecute.ts   # mysql_execute 工具实现
├── dist/                     # TypeScript 编译输出
├── .env.example              # 环境变量配置模板
├── package.json
├── tsconfig.json
└── README.md
```

## 安全建议

1. **使用只读账户**：在无需写入的场景下，为 MCP 服务创建仅具有 SELECT 权限的 MySQL 用户
2. **保持写保护开启**：`ALLOW_WRITE` 默认为 `false`，除非确有必要，不要修改
3. **禁止多语句**：`MYSQL_MULTIPLE_STATEMENTS` 保持 `false`，防止 SQL 注入攻击
4. **不要硬编码凭证**：始终通过环境变量或 `.env` 文件传递数据库连接信息
5. **最小权限原则**：为 MCP 服务使用的数据库账户仅授予必要数据库和表的访问权限

## 相关链接

- [GitHub 仓库](https://github.com/sanzhangshitou/mysql-mcp-server)
- [npm 包](https://www.npmjs.com/package/@sanzhangshitou/mysql-mcp-server)
- [问题反馈](https://github.com/sanzhangshitou/mysql-mcp-server/issues)
- [Model Context Protocol 文档](https://modelcontextprotocol.io)

## License

[MIT](https://github.com/sanzhangshitou/mysql-mcp-server/blob/master/LICENSE)
