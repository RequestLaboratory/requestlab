import { TableSchema, SchemaDiff, TableDiff, ColumnDiff } from '../components/types/sqlTypes';

export interface EnhancedSchemaDiff extends SchemaDiff {
  allTablesLeft: string[];
  allTablesRight: string[];
}

export function diffSchemas(
  left: Record<string, TableSchema>,
  right: Record<string, TableSchema>
): EnhancedSchemaDiff {
  const diff: EnhancedSchemaDiff = {
    tablesOnlyInLeft: [],
    tablesOnlyInRight: [],
    tablesInBoth: {},
    allTablesLeft: Object.keys(left),
    allTablesRight: Object.keys(right),
  };

  // For every table in left
  for (const tableName of diff.allTablesLeft) {
    if (!right[tableName]) {
      diff.tablesOnlyInLeft.push(tableName);
    } else {
      // Table exists in both, compare columns
      const leftTable = left[tableName];
      const rightTable = right[tableName];
      const leftColumns = Object.keys(leftTable.columns);
      const rightColumns = Object.keys(rightTable.columns);
      const columnsOnlyInLeft = leftColumns.filter(c => !rightColumns.includes(c));
      const columnsOnlyInRight = rightColumns.filter(c => !leftColumns.includes(c));
      const changedColumns: Record<string, ColumnDiff> = {};
      for (const columnName of leftColumns) {
        if (rightColumns.includes(columnName)) {
          const leftCol = leftTable.columns[columnName];
          const rightCol = rightTable.columns[columnName];
          if (leftCol.type !== rightCol.type) {
            changedColumns[columnName] = {
              left: leftCol.type,
              right: rightCol.type
            };
          }
        }
      }
      if (
        columnsOnlyInLeft.length > 0 ||
        columnsOnlyInRight.length > 0 ||
        Object.keys(changedColumns).length > 0
      ) {
        diff.tablesInBoth[tableName] = {
          columnsOnlyInLeft,
          columnsOnlyInRight,
          changedColumns
        };
      }
    }
  }

  // For every table in right not in left
  for (const tableName of diff.allTablesRight) {
    if (!left[tableName]) {
      diff.tablesOnlyInRight.push(tableName);
    }
  }

  return diff;
}