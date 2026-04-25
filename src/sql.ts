export function normalizeSql(sql: string): string {
    return sql
        .trim()
        .replace(/^\/\*[\s\S]*?\*\//, "")
        .trim();
}

export function getSqlCommand(sql: string): string {
    const normalized = normalizeSql(sql).toLowerCase();
    const match = normalized.match(/^([a-z]+)/);
    return match?.[1] ?? "";
}

export function isWriteOrDangerousCommand(sql: string): boolean {
    const command = getSqlCommand(sql);

    return [
        "insert",
        "update",
        "delete",
        "replace",
        "create",
        "alter",
        "drop",
        "truncate",
        "grant",
        "revoke",
        "call",
        "set",
        "load",
        "rename",
        "lock",
        "unlock",
        "start",
        "begin",
        "commit",
        "rollback"
    ].includes(command);
}
