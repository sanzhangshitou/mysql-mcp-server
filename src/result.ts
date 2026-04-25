import type { FieldPacket, ResultSetHeader, RowDataPacket } from "mysql2/promise";

export type MysqlRows = RowDataPacket[] | RowDataPacket[][] | ResultSetHeader | ResultSetHeader[];

export function stringifyResult(value: unknown): string {
    return JSON.stringify(value, null, 2);
}

export function formatMysqlResult(rows: MysqlRows, fields?: FieldPacket[]) {
    if (Array.isArray(rows)) {
        return {
            type: "rows",
            rowCount: rows.length,
            rows,
            fields: fields?.map(field => ({
                name: field.name,
                table: field.table,
                orgTable: field.orgTable,
                database: field.db,
                columnLength: field.columnLength,
                columnType: field.columnType,
                flags: field.flags
            }))
        };
    }

    return {
        type: "result",
        affectedRows: rows.affectedRows,
        insertId: rows.insertId,
        changedRows: rows.changedRows,
        warningStatus: rows.warningStatus,
        info: rows.info
    };
}
