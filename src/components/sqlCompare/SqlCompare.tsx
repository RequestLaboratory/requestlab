import React, { useState, useEffect } from 'react';
import { parseMySQLDDL } from '../../utils/sqlParser';
import { diffSchemas, EnhancedSchemaDiff } from '../../utils/sqlDiff';
import SqlEditor from './SqlEditor';
import ComparisonResults from './ComparisonResults';
import { Share2Icon, FileUpIcon, RefreshCwIcon, DatabaseIcon, ArrowLeftRightIcon } from 'lucide-react';
import { TableSchema } from '../types/sqlTypes';
// @ts-ignore: If using JS, ignore missing types for file-saver
import { saveAs } from 'file-saver';

const SqlCompare: React.FC = () => {
  const [leftSql, setLeftSql] = useState('');
  const [rightSql, setRightSql] = useState('');
  const [diff, setDiff] = useState<EnhancedSchemaDiff | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  useEffect(() => {
    // On mount, check for leftSql and rightSql in the URL
    const params = new URLSearchParams(window.location.search);
    const left = params.get('leftSql');
    const right = params.get('rightSql');
    if (left) setLeftSql(decodeURIComponent(left));
    if (right) setRightSql(decodeURIComponent(right));
  }, []);

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
    // Build the share URL with encoded SQL
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    if (leftSql) params.set('leftSql', leftSql);
    if (rightSql) params.set('rightSql', rightSql);
    const shareUrl = `${baseUrl}?mode=sql&${params.toString()}`;
    navigator.clipboard.writeText(shareUrl);
    setShowCopiedMessage(true);
    setTimeout(() => setShowCopiedMessage(false), 2000);
  };

  const exportSchemas = () => {
    try {
      const leftSchema = parseMySQLDDL(leftSql);
      const rightSchema = parseMySQLDDL(rightSql);
      const leftBlob = new Blob([JSON.stringify(leftSchema, null, 2)], { type: 'application/json' });
      const rightBlob = new Blob([JSON.stringify(rightSchema, null, 2)], { type: 'application/json' });
      saveAs(leftBlob, 'left-schema.json');
      saveAs(rightBlob, 'right-schema.json');
    } catch (e) {
      alert('Failed to export schemas. Please check the SQL syntax.');
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-orange-600 dark:text-orange-400 mb-4 flex items-center">
          <ArrowLeftRightIcon className="h-5 w-5 mr-2" />
          Compare MySQL Database Schemas
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-3">
          Paste your MySQL schema dumps below or upload .sql files to compare them and identify differences.
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142-.0852 4.783-2.7582a.7712.7712 0 0 0 .7806 0l5.8428 3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6467zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
            </svg>
            <span className="text-sm text-blue-800 dark:text-blue-200">
              <strong>💡 Tip:</strong> Need help generating SQL migration scripts? Check out the <a href="/documentation#export-ai-migration" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline font-medium cursor-pointer">Export and AI Migration Assistant</a> section in our documentation for ChatGPT integration.
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left SQL Input */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium text-orange-600 dark:text-orange-400">Left Schema</h2>
            <button 
              onClick={() => loadExample('left')}
              className="text-sm text-gray-500 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors flex items-center"
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
            <h2 className="text-lg font-medium text-orange-600 dark:text-orange-400">Right Schema</h2>
            <button 
              onClick={() => loadExample('right')}
              className="text-sm text-gray-500 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors flex items-center"
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
            className="px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 font-medium flex items-center gap-2 transition-colors"
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