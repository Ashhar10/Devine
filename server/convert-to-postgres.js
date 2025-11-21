// Script to convert MySQL queries to PostgreSQL in route files
// Run with: node convert-to-postgres.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routesDir = path.join(__dirname, 'src', 'routes');

// Files to convert
const files = ['customers.js', 'deliveries.js', 'orders.js', 'payments.js', 'stats.js'];

function convertMySQLtoPostgreSQL(content) {
    let newContent = content;

    // Pattern 1: const [rows] = await pool.execute('query', [params])
    // Replace with: const result = await pool.query('query', [params]); const rows = result.rows;

    // First, replace all pool.execute with pool.query
    newContent = newContent.replace(/pool\.execute\(/g, 'pool.query(');

    // Replace parameter placeholders ? with $1, $2, $3, etc.
    let paramIndex = 0;
    newContent = newContent.replace(/(['"`])([^'"`]*)\1/g, (match, quote, sqlQuery) => {
        // Only process if it looks like a SQL query (contains SELECT, INSERT, UPDATE, DELETE)
        if (!/\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|SET)\b/i.test(sqlQuery)) {
            return match;
        }

        // Reset paramIndex for each query
        let newQuery = sqlQuery;
        let currentIndex = 1;

        // Replace ? with $1, $2, etc.
        newQuery = newQuery.replace(/\?/g, () => `$${currentIndex++}`);

        return quote + newQuery + quote;
    });

    // Replace array destructuring patterns:
    // const [rows] = await pool.query(...) -> const result = await pool.query(...); const rows = result.rows;
    // const [result] = await pool.query(...) -> const queryResult = await pool.query(...); const result = { ...similar conversion...}

    newContent = newContent.replace(
        /const \[(\w+)\] = await pool\.query\(([^;]+)\);/g,
        (match, varName, queryPart) => {
            if (varName === 'rows') {
                return `const result = await pool.query(${queryPart});\n  const ${varName} = result.rows;`;
            } else if (varName === 'result') {
                // This is for INSERT/UPDATE/DELETE results
                return `const queryResult = await pool.query(${queryPart});\n  const ${varName} = { insertId: queryResult.rows[0]?.id, affectedRows: queryResult.rowCount };`;
            }
            return `const queryResult = await pool.query(${queryPart});\n  const ${varName} = queryResult.rows;`;
        }
    );

    return newContent;
}

// Process each file
files.forEach(file => {
    const filePath = path.join(routesDir, file);

    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skipping ${file} - file not found`);
        return;
    }

    console.log(`Processing ${file}...`);

    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = convertMySQLtoPostgreSQL(content);

    // Create backup
    fs.writeFileSync(filePath + '.backup', content);

    // Write new content
    fs.writeFileSync(filePath, newContent);

    console.log(`✅ Converted ${file}`);
});

console.log('\n🎉 All files converted! Backups created with .backup extension');
console.log('⚠️  IMPORTANT: Review the changes manually as automated conversion may need adjustments!');
