import { TableSchema, ColumnDefinition } from '../components/types/sqlTypes';

// Helper: Split columns block by commas, but ignore commas inside parentheses
function splitColumnsBlock(block: string): string[] {
  const result: string[] = [];
  let current = '';
  let parenLevel = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let i = 0; i < block.length; i++) {
    const char = block[i];
    if (char === "'" && !inDoubleQuote) inSingleQuote = !inSingleQuote;
    else if (char === '"' && !inSingleQuote) inDoubleQuote = !inDoubleQuote;
    else if (!inSingleQuote && !inDoubleQuote) {
      if (char === '(') parenLevel++;
      else if (char === ')') parenLevel--;
      else if (char === ',' && parenLevel === 0) {
        result.push(current.trim());
        current = '';
        continue;
      }
    }
    current += char;
  }
  if (current.trim()) result.push(current.trim());
  return result;
}

export function parseMySQLDDL(sql: string): Record<string, TableSchema> {
  const tables: Record<string, TableSchema> = {};

  // Remove multi-line and single-line comments
  const noComments = sql.replace(/\/\*[\s\S]*?\*\//g, '').replace(/--.*$/gm, '');

  // Match CREATE TABLE ... ; blocks
  const createTableRegex = /CREATE TABLE[\s\S]*?;/gi;
  const matches = noComments.match(createTableRegex) || [];

  for (const match of matches) {
    // Extract table name
    const tableNameMatch = match.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?[`'"]?(\w+)[`'"]?/i);
    if (!tableNameMatch) continue;
    const tableName = tableNameMatch[1];

    // Extract columns block (between first ( and the matching ))
    const firstParen = match.indexOf('(');
    let parenCount = 0, endParen = -1;
    for (let i = firstParen; i < match.length; i++) {
      if (match[i] === '(') parenCount++;
      else if (match[i] === ')') parenCount--;
      if (parenCount === 0 && i > firstParen) {
        endParen = i;
        break;
      }
    }
    if (firstParen === -1 || endParen === -1) continue;
    const columnsBlock = match.slice(firstParen + 1, endParen);

    // Parse columns
    const columns: Record<string, ColumnDefinition> = {};
    const lines = splitColumnsBlock(columnsBlock);
    for (const line of lines) {
      if (!line) continue;
      const columnRegex = /^[`"]?(\w+)[`"]?\s+([\w]+(?:\([^)]*\))?(?:\s+unsigned)?)(?:\s+(.*?))?$/i;
      const columnMatch = line.match(columnRegex);
      if (columnMatch && !/^PRIMARY KEY|^UNIQUE KEY|^KEY|^CONSTRAINT|^FOREIGN KEY|^INDEX/i.test(line)) {
        const [, colName, colType, rest = ''] = columnMatch;
        const nullable = !rest.toUpperCase().includes('NOT NULL');
        const defaultMatch = rest.match(/DEFAULT\s+([^,\s]+)/i);
        const default_ = defaultMatch ? defaultMatch[1] : undefined;
        const extraMatch = rest.match(/AUTO_INCREMENT|GENERATED ALWAYS/i);
        const extra = extraMatch ? extraMatch[0] : undefined;
        columns[colName] = {
          type: colType,
          raw: line,
          nullable,
          default: default_,
          extra
        };
      }
    }
    tables[tableName] = {
      name: tableName,
      columns,
      raw: match,
      engine: undefined,
      charset: undefined
    };
  }
  return tables;
}