import { TableSchema, SchemaDiff, TableDiff, ColumnDiff } from '../components/types/sqlTypes';

export interface EnhancedSchemaDiff extends SchemaDiff {
  allTablesLeft: string[];
  allTablesRight: string[];
}

// Patch TableDiff type for changedIndexes and changedUniqueKeys
export type ChangedKeyDiff = Record<string, { left: string[]; right: string[] }>;

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
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
      // PRIMARY KEY diff
      let primaryKeyChanged = false;
      if (!arraysEqual(leftTable.primaryKey, rightTable.primaryKey)) {
        primaryKeyChanged = true;
      }
      // UNIQUE KEYS diff
      const leftUniqueKeys = Object.keys(leftTable.uniqueKeys);
      const rightUniqueKeys = Object.keys(rightTable.uniqueKeys);
      const uniqueKeysOnlyInLeft = leftUniqueKeys.filter(k => !rightUniqueKeys.includes(k));
      const uniqueKeysOnlyInRight = rightUniqueKeys.filter(k => !leftUniqueKeys.includes(k));
      const changedUniqueKeys: ChangedKeyDiff = {};
      for (const key of leftUniqueKeys) {
        if (rightUniqueKeys.includes(key)) {
          if (!arraysEqual(leftTable.uniqueKeys[key], rightTable.uniqueKeys[key])) {
            changedUniqueKeys[key] = {
              left: leftTable.uniqueKeys[key],
              right: rightTable.uniqueKeys[key],
            };
          }
        }
      }
      // INDEXES diff
      const leftIndexes = Object.keys(leftTable.indexes);
      const rightIndexes = Object.keys(rightTable.indexes);
      const indexesOnlyInLeft = leftIndexes.filter(k => !rightIndexes.includes(k));
      const indexesOnlyInRight = rightIndexes.filter(k => !leftIndexes.includes(k));
      const changedIndexes: ChangedKeyDiff = {};
      for (const key of leftIndexes) {
        if (rightIndexes.includes(key)) {
          if (!arraysEqual(leftTable.indexes[key], rightTable.indexes[key])) {
            changedIndexes[key] = {
              left: leftTable.indexes[key],
              right: rightTable.indexes[key],
            };
          }
        }
      }
      if (
        columnsOnlyInLeft.length > 0 ||
        columnsOnlyInRight.length > 0 ||
        Object.keys(changedColumns).length > 0 ||
        primaryKeyChanged ||
        uniqueKeysOnlyInLeft.length > 0 ||
        uniqueKeysOnlyInRight.length > 0 ||
        Object.keys(changedUniqueKeys).length > 0 ||
        indexesOnlyInLeft.length > 0 ||
        indexesOnlyInRight.length > 0 ||
        Object.keys(changedIndexes).length > 0
      ) {
        diff.tablesInBoth[tableName] = {
          columnsOnlyInLeft,
          columnsOnlyInRight,
          changedColumns,
          primaryKeyChanged,
          uniqueKeysOnlyInLeft,
          uniqueKeysOnlyInRight,
          changedUniqueKeys,
          indexesOnlyInLeft,
          indexesOnlyInRight,
          changedIndexes,
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