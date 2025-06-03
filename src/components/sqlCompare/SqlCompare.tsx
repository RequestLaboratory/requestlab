import React, { useState } from 'react';
import { parseMySQLDDL } from '../../utils/sqlParser';
import { diffSchemas, EnhancedSchemaDiff } from '../../utils/sqlDiff';
import SqlEditor from './SqlEditor';
import ComparisonResults from './ComparisonResults';
import { Share2Icon, FileUpIcon, RefreshCwIcon, DatabaseIcon, ArrowLeftRightIcon } from 'lucide-react';
import { TableSchema } from '../types/sqlTypes';

const SqlCompare: React.FC = () => {
  const [leftSql, setLeftSql] = useState('');
  const [rightSql, setRightSql] = useState('');
  const [diff, setDiff] = useState<EnhancedSchemaDiff | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  // File upload handlers
  const handleFileUpload = (side: 'left' | 'right', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (side === 'left') setLeftSql(content);
      else setRightSql(content);
    };
    reader.readAsText(file);
  };

  // Compare logic
  const handleCompare = () => {
    setError(null);
    setIsComparing(true);
    
    try {
      const leftSchema = parseMySQLDDL(leftSql);
      const rightSchema = parseMySQLDDL(rightSql);
      const diffResult = diffSchemas(leftSchema, rightSchema);
      setDiff(diffResult);
    } catch (e) {
      setError('Failed to compare SQL schemas. Please check the syntax.');
      console.error(e);
    } finally {
      setIsComparing(false);
    }
  };

  const loadExample = (side: 'left' | 'right') => {
    const exampleSQL = `CREATE DATABASE  IF NOT EXISTS \`example_db\` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
        USE \`example_db\`;

        DROP TABLE IF EXISTS \`users\`;
        /*!40101 SET @saved_cs_client     = @@character_set_client */;
        /*!50503 SET character_set_client = utf8mb4 */;
        CREATE TABLE \`users\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`username\` varchar(50) NOT NULL,
        \`email\` varchar(100) NOT NULL,
        \`password\` varchar(255) NOT NULL,
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY (\`email\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

    // Add a slight difference if it's the right side
    const rightExampleSQL = `CREATE DATABASE  IF NOT EXISTS \`example_db\` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
        USE \`example_db\`;

        DROP TABLE IF EXISTS \`users\`;
        /*!40101 SET @saved_cs_client     = @@character_set_client */;
        /*!50503 SET character_set_client = utf8mb4 */;
        CREATE TABLE \`users\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`username\` varchar(50) NOT NULL,
        \`email\` varchar(150) NOT NULL,
        \`password\` varchar(255) NOT NULL,
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY (\`email\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`

    console.log(side, "side==");

    if (side === 'left') {
      setLeftSql(exampleSQL);
    } else {
      setRightSql(rightExampleSQL);
    }
  };

  const copyShareLink = () => {
    setShowCopiedMessage(true);
    setTimeout(() => setShowCopiedMessage(false), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4 flex items-center">
          <ArrowLeftRightIcon className="h-5 w-5 mr-2" />
          Compare MySQL Database Schemas
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Paste your MySQL schema dumps below or upload .sql files to compare them and identify differences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left SQL Input */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium text-blue-600 dark:text-blue-400">Left Schema</h2>
            <button 
              onClick={() => loadExample('left')}
              className="text-sm text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
            >
              <DatabaseIcon className="w-3.5 h-3.5 mr-1" />
              Load Left Example
            </button>
          </div>
          <SqlEditor 
            value={leftSql} 
            onChange={setLeftSql} 
            onFileUpload={(e) => handleFileUpload('left', e)}
          />
        </div>
        
        {/* Right SQL Input */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium text-blue-600 dark:text-blue-400">Right Schema</h2>
            <button 
              onClick={() => loadExample('right')}
              className="text-sm text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
            >
              <DatabaseIcon className="w-3.5 h-3.5 mr-1" />
              Load Right Example
            </button>
          </div>
          <SqlEditor 
            value={rightSql} 
            onChange={setRightSql} 
            onFileUpload={(e) => handleFileUpload('right', e)}
          />
        </div>
      </div>
      
      <div className="flex justify-evenly items-center mb-10">
        <div className="flex items-center gap-4">
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium flex items-center gap-2 transition-colors"
            onClick={handleCompare}
            disabled={isComparing || !leftSql || !rightSql}
          >
            {isComparing ? (
              <>
                <RefreshCwIcon className="w-4 h-4 animate-spin" />
                Comparing...
              </>
            ) : (
              <>
                <RefreshCwIcon className="w-4 h-4" />
                Compare Schemas
              </>
            )}
          </button>
          {error && <span className="text-red-500 dark:text-red-400">{error}</span>}
        </div>
        
        <div className="relative">
          <button
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700 font-medium flex items-center gap-2 transition-colors"
            onClick={copyShareLink}
          >
            <Share2Icon className="w-4 h-4" />
            Copy Share Link
          </button>
          {showCopiedMessage && (
            <div className="absolute top-full right-0 mt-2 px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white text-xs rounded shadow-lg">
              Share link copied!
            </div>
          )}
        </div>
      </div>
      
      {diff && (
        <ComparisonResults diff={diff} leftSchema={parseMySQLDDL(leftSql)} rightSchema={parseMySQLDDL(rightSql)} />
      )}
    </div>
  );
};

export default SqlCompare;