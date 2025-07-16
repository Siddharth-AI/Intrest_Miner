// getRecordByField(table, field, value, fieldsArray)
async function getRecordByField(table, field, value, fields = ['*']) {
    const query = `SELECT ${fields.join(',')} FROM ${table} WHERE ${field} = ? AND is_deleted = 0 LIMIT 1`;
    const [rows] = await db.promise().query(query, [value]);
    return rows[0] || null;
}

// updateRecord(table, data, where)
async function updateRecord(table, data, where) {
    const set = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = Object.values(data);
    const whereClause = Object.keys(where).map(k => `${k} = ?`).join(' AND ');
    const whereValues = Object.values(where);
    const query = `UPDATE ${table} SET ${set} WHERE ${whereClause}`;
    await db.promise().query(query, [...values, ...whereValues]);
}

// checkRecordExists(table, field, value)
async function checkRecordExists(table, field, value) {
    const query = `SELECT 1 FROM ${table} WHERE ${field} = ? AND is_deleted = 0 LIMIT 1`;
    const [rows] = await db.promise().query(query, [value]);
    return rows.length > 0;
}
module.exports ={
    getRecordByField,
    checkRecordExists,
    updateRecord,

};