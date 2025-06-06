import React from 'react';
import { EnhancedSchemaDiff } from '../../utils/sqlDiff';
import { ChevronDownIcon, ChevronRightIcon, PlusIcon, MinusIcon, RefreshCwIcon, MaximizeIcon, DatabaseIcon, XIcon, FileDownIcon } from 'lucide-react';
import { TableSchema } from '../types/sqlTypes';
import { saveAs } from 'file-saver';

interface ComparisonResultsProps {
  diff: EnhancedSchemaDiff;
  leftSchema: Record<string, TableSchema>;
  rightSchema: Record<string, TableSchema>;
}

const ComparisonResults: React.FC<ComparisonResultsProps> = ({ diff, leftSchema, rightSchema }) => {
  const [expandedTables, setExpandedTables] = React.useState<Record<string, boolean>>({});
  const [modalOpen, setModalOpen] = React.useState(false);

  const toggleTable = (tableName: string) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };

  // Get all unique table names from both sides for a full side-by-side list
  const allTables = Array.from(new Set([...diff.allTablesLeft, ...diff.allTablesRight]));

  // Export left schema difference
  const exportLeftDiff = () => {
    const result: Record<string, any> = {};
    // Tables only in left
    diff.tablesOnlyInLeft.forEach(table => {
      result[table] = leftSchema[table];
    });
    // Tables in both with differences
    Object.entries(diff.tablesInBoth).forEach(([table, tableDiff]) => {
      if (leftSchema[table]) {
        // Only include changed columns/keys
        const tableObj: any = { ...leftSchema[table] };
        if (tableDiff.columnsOnlyInLeft.length > 0) {
          tableObj.columns = tableDiff.columnsOnlyInLeft.reduce((acc, col) => {
            acc[col] = leftSchema[table].columns[col];
            return acc;
          }, {} as any);
        }
        if (Object.keys(tableDiff.changedColumns).length > 0) {
          tableObj.changedColumns = tableDiff.changedColumns;
        }
        result[table] = tableObj;
      }
    });
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    saveAs(blob, 'left-schema-diff.json');
  };

  // Export right schema difference
  const exportRightDiff = () => {
    const result: Record<string, any> = {};
    // Tables only in right
    diff.tablesOnlyInRight.forEach(table => {
      result[table] = rightSchema[table];
    });
    // Tables in both with differences
    Object.entries(diff.tablesInBoth).forEach(([table, tableDiff]) => {
      if (rightSchema[table]) {
        // Only include changed columns/keys
        const tableObj: any = { ...rightSchema[table] };
        if (tableDiff.columnsOnlyInRight.length > 0) {
          tableObj.columns = tableDiff.columnsOnlyInRight.reduce((acc, col) => {
            acc[col] = rightSchema[table].columns[col];
            return acc;
          }, {} as any);
        }
        if (Object.keys(tableDiff.changedColumns).length > 0) {
          tableObj.changedColumns = tableDiff.changedColumns;
        }
        result[table] = tableObj;
      }
    });
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    saveAs(blob, 'right-schema-diff.json');
  };

  // Extract the main content as a function for reuse
  const renderContent = () => (
    <>
      {/* Table lists at the top */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center mb-2">
            <h4 className="text-orange-600 dark:text-orange-400 font-medium mr-2">Tables in Left</h4>
            <button
              onClick={exportLeftDiff}
              className="ml-2 px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold border border-orange-300 dark:border-orange-700 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <FileDownIcon className="w-4 h-4" />
              Export Left Diff
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {diff.allTablesLeft.length === 0 && <span className="text-gray-500 dark:text-gray-400">None</span>}
            {diff.allTablesLeft.map(table => (
              <span key={table} className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2 py-1 rounded text-xs font-mono">{table}</span>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center mb-2">
            <h4 className="text-orange-600 dark:text-orange-400 font-medium mr-2">Tables in Right</h4>
            <button
              onClick={exportRightDiff}
              className="ml-2 px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold border border-orange-300 dark:border-orange-700 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <FileDownIcon className="w-4 h-4" />
              Export Right Diff
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {diff.allTablesRight.length === 0 && <span className="text-gray-500 dark:text-gray-400">None</span>}
            {diff.allTablesRight.map(table => (
              <span key={table} className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2 py-1 rounded text-xs font-mono">{table}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <MinusIcon className="w-4 h-4 text-red-500 dark:text-red-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Tables/Fields removed</span>
        </div>
        <div className="flex items-center space-x-2">
          <PlusIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Tables/Fields added</span>
        </div>
        <div className="flex items-center space-x-2">
          <RefreshCwIcon className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Modified fields</span>
        </div>
      </div>

      {/* Table-by-table side-by-side diff */}
      {allTables.map(tableName => {
        const inLeft = diff.allTablesLeft.includes(tableName);
        const inRight = diff.allTablesRight.includes(tableName);
        const tableDiff = diff.tablesInBoth[tableName];
        const removed = diff.tablesOnlyInLeft.includes(tableName);
        const added = diff.tablesOnlyInRight.includes(tableName);
        // Get leftTable and rightTable for key/index/primaryKey display
        const leftTable = inLeft ? leftSchema[tableName] : undefined;
        const rightTable = inRight ? rightSchema[tableName] : undefined;
        return (
          <div key={tableName} className="border-b border-gray-200 dark:border-gray-700">
            <div
              className="p-3 bg-gray-100 dark:bg-gray-800 flex items-center justify-between cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-750"
              onClick={() => toggleTable(tableName)}
            >
              <h4 className="font-medium flex items-center">
                {removed && <MinusIcon className="w-4 h-4 mr-2 text-red-500 dark:text-red-400" />}
                {added && <PlusIcon className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />}
                {tableDiff && !removed && !added && <RefreshCwIcon className="w-4 h-4 mr-2 text-yellow-500 dark:text-yellow-400" />}
                <span className={removed ? 'text-red-500 dark:text-red-400' : added ? 'text-green-600 dark:text-green-400' : tableDiff ? 'text-yellow-500 dark:text-yellow-400' : 'text-gray-900 dark:text-gray-200'}>
                  {tableName}
                </span>
              </h4>
              {expandedTables[tableName] ? (
                <ChevronDownIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronRightIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              )}
            </div>
            {expandedTables[tableName] && (
              <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
                <div className="p-4 bg-gray-50 dark:bg-gray-800">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Left Schema</h5>
                  <div className="font-mono text-sm space-y-1">
                    {/* Primary Key diff */}
                    {inLeft && tableDiff && tableDiff.primaryKeyChanged && (
                      <div className="text-yellow-500 dark:text-yellow-400">~ PRIMARY KEY: {leftTable && leftTable.primaryKey ? leftTable.primaryKey.join(', ') : ''}</div>
                    )}
                    {/* Unique Keys only in left */}
                    {inLeft && tableDiff && tableDiff.uniqueKeysOnlyInLeft && tableDiff.uniqueKeysOnlyInLeft.map(key => (
                      <div key={key} className="text-red-500 dark:text-red-400">- UNIQUE KEY {key}: {leftTable && leftTable.uniqueKeys && leftTable.uniqueKeys[key] ? leftTable.uniqueKeys[key].join(', ') : ''}</div>
                    ))}
                    {/* Unique Keys changed */}
                    {inLeft && tableDiff && tableDiff.changedUniqueKeys && Object.entries(tableDiff.changedUniqueKeys).map(([key, val]) => (
                      <div key={key} className="text-yellow-500 dark:text-yellow-400">~ UNIQUE KEY {key}: {val.left.join(', ')}</div>
                    ))}
                    {/* Indexes only in left */}
                    {inLeft && tableDiff && tableDiff.indexesOnlyInLeft && tableDiff.indexesOnlyInLeft.map(key => (
                      <div key={key} className="text-red-500 dark:text-red-400">- KEY {key}: {leftTable && leftTable.indexes && leftTable.indexes[key] ? leftTable.indexes[key].join(', ') : ''}</div>
                    ))}
                    {/* Indexes changed */}
                    {inLeft && tableDiff && tableDiff.changedIndexes && Object.entries(tableDiff.changedIndexes).map(([key, val]) => (
                      <div key={key} className="text-yellow-500 dark:text-yellow-400">~ KEY {key}: {val.left.join(', ')}</div>
                    ))}
                    {/* Columns diff */}
                    {!inLeft && <div className="text-red-500 dark:text-red-400">(missing)</div>}
                    {inLeft && tableDiff && tableDiff.columnsOnlyInLeft.map(col => (
                      <div key={col} className="text-red-500 dark:text-red-400">- {col}</div>
                    ))}
                    {inLeft && tableDiff && Object.entries(tableDiff.changedColumns).map(([col, change]) => (
                      <div key={col} className="text-yellow-500 dark:text-yellow-400">~ {col}: {change.left}</div>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Right Schema</h5>
                  <div className="font-mono text-sm space-y-1">
                    {/* Primary Key diff */}
                    {inRight && tableDiff && tableDiff.primaryKeyChanged && (
                      <div className="text-yellow-500 dark:text-yellow-400">~ PRIMARY KEY: {rightTable && rightTable.primaryKey ? rightTable.primaryKey.join(', ') : ''}</div>
                    )}
                    {/* Unique Keys only in right */}
                    {inRight && tableDiff && tableDiff.uniqueKeysOnlyInRight && tableDiff.uniqueKeysOnlyInRight.map(key => (
                      <div key={key} className="text-green-600 dark:text-green-400">+ UNIQUE KEY {key}: {rightTable && rightTable.uniqueKeys && rightTable.uniqueKeys[key] ? rightTable.uniqueKeys[key].join(', ') : ''}</div>
                    ))}
                    {/* Unique Keys changed */}
                    {inRight && tableDiff && tableDiff.changedUniqueKeys && Object.entries(tableDiff.changedUniqueKeys).map(([key, val]) => (
                      <div key={key} className="text-yellow-500 dark:text-yellow-400">~ UNIQUE KEY {key}: {val.right.join(', ')}</div>
                    ))}
                    {/* Indexes only in right */}
                    {inRight && tableDiff && tableDiff.indexesOnlyInRight && tableDiff.indexesOnlyInRight.map(key => (
                      <div key={key} className="text-green-600 dark:text-green-400">+ KEY {key}: {rightTable && rightTable.indexes && rightTable.indexes[key] ? rightTable.indexes[key].join(', ') : ''}</div>
                    ))}
                    {/* Indexes changed */}
                    {inRight && tableDiff && tableDiff.changedIndexes && Object.entries(tableDiff.changedIndexes).map(([key, val]) => (
                      <div key={key} className="text-yellow-500 dark:text-yellow-400">~ KEY {key}: {val.right.join(', ')}</div>
                    ))}
                    {/* Columns diff */}
                    {!inRight && <div className="text-green-600 dark:text-green-400">(missing)</div>}
                    {inRight && tableDiff && tableDiff.columnsOnlyInRight.map(col => (
                      <div key={col} className="text-green-600 dark:text-green-400">+ {col}</div>
                    ))}
                    {inRight && tableDiff && Object.entries(tableDiff.changedColumns).map(([col, change]) => (
                      <div key={col} className="text-yellow-500 dark:text-yellow-400">~ {col}: {change.right}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="bg-gray-100 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <DatabaseIcon className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400" />
          Schema Differences
        </h3>
        <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors" onClick={() => setModalOpen(true)}>
          <MaximizeIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
      {renderContent()}
      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 relative">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <DatabaseIcon className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400" />
                Schema Differences
              </h3>
              <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors" onClick={() => setModalOpen(false)}>
                <XIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div>{renderContent()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonResults;