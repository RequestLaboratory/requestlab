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
    const tableNameMatch = match.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?[`'\"]?(\w+)[`'\"]?/i);
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

    // Parse columns and constraints
    const columns: Record<string, ColumnDefinition> = {};
    let primaryKey: string[] = [];
    let uniqueKeys: Record<string, string[]> = {};
    let indexes: Record<string, string[]> = {};
    const lines = splitColumnsBlock(columnsBlock);
    for (const line of lines) {
      if (!line) continue;
      // Column definition
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
      // PRIMARY KEY
      const pkMatch = line.match(/^PRIMARY KEY\s*\(([^)]+)\)/i);
      if (pkMatch) {
        primaryKey = pkMatch[1].split(',').map(s => s.replace(/[`"'\s]/g, '')).filter(Boolean);
      }
      // UNIQUE KEY (with or without name)
      const uqMatch = line.match(/^UNIQUE KEY\s+[`"']?(\w+)[`"']?\s*\(([^)]+)\)/i);
      if (uqMatch) {
        const keyName = uqMatch[1];
        const cols = uqMatch[2].split(',').map(s => s.replace(/[`"'\s]/g, '')).filter(Boolean);
        uniqueKeys[keyName] = cols;
      } else {
        // UNIQUE KEY without name: UNIQUE KEY (`col1`)
        const uqNoNameMatch = line.match(/^UNIQUE KEY\s*\(([^)]+)\)/i);
        if (uqNoNameMatch) {
          const cols = uqNoNameMatch[1].split(',').map(s => s.replace(/[`"'\s]/g, '')).filter(Boolean);
          // Use a generated name for unnamed unique keys
          const keyName = 'unnamed_' + cols.join('_');
          uniqueKeys[keyName] = cols;
        } else {
          // UNIQUE (`col1`) (no KEY keyword)
          const uqShortMatch = line.match(/^UNIQUE\s*\(([^)]+)\)/i);
          if (uqShortMatch) {
            const cols = uqShortMatch[1].split(',').map(s => s.replace(/[`"'\s]/g, '')).filter(Boolean);
            const keyName = 'unnamed_' + cols.join('_');
            uniqueKeys[keyName] = cols;
          } else {
            // CONSTRAINT ... UNIQUE KEY ...
            const uqConstraintMatch = line.match(/^CONSTRAINT\s+[`"']?(\w+)[`"']?\s+UNIQUE KEY\s+[`"']?(\w+)[`"']?\s*\(([^)]+)\)/i);
            if (uqConstraintMatch) {
              const keyName = uqConstraintMatch[2];
              const cols = uqConstraintMatch[3].split(',').map(s => s.replace(/[`"'\s]/g, '')).filter(Boolean);
              uniqueKeys[keyName] = cols;
            }
          }
        }
      }
      // KEY (regular index)
      const idxMatch = line.match(/^KEY\s+[`"']?(\w+)[`"']?\s*\(([^)]+)\)/i);
      if (idxMatch) {
        const keyName = idxMatch[1];
        const cols = idxMatch[2].split(',').map(s => s.replace(/[`"'\s]/g, '')).filter(Boolean);
        indexes[keyName] = cols;
      }
    }
    tables[tableName] = {
      name: tableName,
      columns,
      raw: match,
      primaryKey,
      uniqueKeys,
      indexes,
      engine: undefined,
      charset: undefined
    };
  }
  return tables;
}