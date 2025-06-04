export interface ColumnDefinition {
    type: string;
    raw: string;
    nullable?: boolean;
    default?: string;
    extra?: string;
  }
  
  export interface TableSchema {
    name: string;
    columns: Record<string, ColumnDefinition>;
    raw: string;
    primaryKey: string[];
    uniqueKeys: Record<string, string[]>;
    indexes: Record<string, string[]>;
    foreignKeys?: ForeignKeyDefinition[];
    engine?: string;
    charset?: string;
  }
  
  export interface IndexDefinition {
    name: string;
    columns: string[];
    type: 'PRIMARY' | 'UNIQUE' | 'INDEX' | 'FULLTEXT' | 'SPATIAL';
    raw: string;
  }
  
  export interface ForeignKeyDefinition {
    columns: string[];
    referencedTable: string;
    referencedColumns: string[];
    onDelete?: string;
    onUpdate?: string;
    raw: string;
  }
  
  export interface SchemaDiff {
    tablesOnlyInLeft: string[];
    tablesOnlyInRight: string[];
    tablesInBoth: Record<string, TableDiff>;
  }
  
  export interface TableDiff {
    columnsOnlyInLeft: string[];
    columnsOnlyInRight: string[];
    changedColumns: Record<string, ColumnDiff>;
    indexesOnlyInLeft?: string[];
    indexesOnlyInRight?: string[];
    changedIndexes?: ChangedKeyDiff;
    primaryKeyChanged?: boolean;
    uniqueKeysOnlyInLeft?: string[];
    uniqueKeysOnlyInRight?: string[];
    changedUniqueKeys?: ChangedKeyDiff;
    foreignKeysChanged?: boolean;
    engineChanged?: boolean;
    charsetChanged?: boolean;
  }
  
  export type ChangedKeyDiff = Record<string, { left: string[]; right: string[] }>;
  
  export interface ColumnDiff {
    left: string;
    right: string;
  }
  
  export interface IndexDiff {
    left: IndexDefinition;
    right: IndexDefinition;
  }