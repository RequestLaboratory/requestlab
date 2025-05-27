import React from 'react';
import { JsonDiff } from '../types';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface DiffViewerProps {
  diff: JsonDiff | null;
  error?: string;
  leftJson?: string;
  rightJson?: string;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ diff, error, leftJson, rightJson }) => {
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md border border-red-200 dark:border-red-800">
        <h3 className="text-red-600 dark:text-red-400 font-medium mb-2">Error</h3>
        <p className="text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  if (!leftJson || !rightJson) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-gray-500 dark:text-gray-400">
        <p className="mb-4">Enter valid JSON in both panels to see the differences</p>
      </div>
    );
  }

  // Parse JSON strings into objects
  let leftObj: any, rightObj: any;
  try {
    leftObj = JSON.parse(leftJson);
    rightObj = JSON.parse(rightJson);
  } catch (e) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md border border-red-200 dark:border-red-800">
        <h3 className="text-red-600 dark:text-red-400 font-medium mb-2">Error</h3>
        <p className="text-red-700 dark:text-red-300">Invalid JSON format</p>
      </div>
    );
  }

  const leftLines = leftJson.split('\n');
  const rightLines = rightJson.split('\n');

  // Function to get all field names from a JSON object
  const getAllFields = (obj: any, prefix: string = ''): string[] => {
    let fields: string[] = [];
    
    if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => {
        const fieldName = prefix ? `${prefix}.${key}` : key;
        fields.push(fieldName);
        
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          fields = fields.concat(getAllFields(obj[key], fieldName));
        }
      });
    }
    
    return fields;
  };

  // Get all fields from both JSONs
  const leftFields = new Set(getAllFields(leftObj));
  const rightFields = new Set(getAllFields(rightObj));

  // Find differences
  const onlyInLeft = new Set([...leftFields].filter(x => !rightFields.has(x)));
  const onlyInRight = new Set([...rightFields].filter(x => !leftFields.has(x)));

  // Function to check if a line should be highlighted
  const shouldHighlightLine = (line: string, isLeft: boolean): boolean => {
    const fieldMatch = line.match(/^\s*"([^"]+)"\s*:/);
    if (!fieldMatch) return false;

    const fieldName = fieldMatch[1];
    const differences = isLeft ? onlyInLeft : onlyInRight;
    
    // Check if this field name is in the differences
    return Array.from(differences).some(path => {
      const lastField = path.split('.').pop();
      return lastField === fieldName;
    });
  };

  return (
    <div className="overflow-y-auto p-4 bg-white dark:bg-gray-800 rounded-md shadow-inner border border-gray-200 dark:border-gray-700">
      <div className="font-medium text-xl mb-4 text-gray-800 dark:text-white">Field Name Differences</div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Left Panel */}
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 bg-gray-100 dark:bg-gray-700 p-2 rounded-t-md border-b border-gray-200 dark:border-gray-600">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Original</span>
          </div>
          <div className="mt-10">
            <SyntaxHighlighter
              language="json"
              style={vs2015}
              customStyle={{
                margin: 0,
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                lineHeight: '1.5rem',
              }}
              showLineNumbers
              wrapLines
              lineProps={(lineNumber) => {
                const line = leftLines[lineNumber - 1];
                const shouldHighlight = shouldHighlightLine(line, true);
                return {
                  style: {
                    backgroundColor: shouldHighlight ? 'rgba(239, 68, 68, 0.1)' : undefined,
                    display: 'block',
                  },
                };
              }}
            >
              {leftJson}
            </SyntaxHighlighter>
          </div>
        </div>

        {/* Right Panel */}
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 bg-gray-100 dark:bg-gray-700 p-2 rounded-t-md border-b border-gray-200 dark:border-gray-600">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Modified</span>
          </div>
          <div className="mt-10">
            <SyntaxHighlighter
              language="json"
              style={vs2015}
              customStyle={{
                margin: 0,
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                lineHeight: '1.5rem',
              }}
              showLineNumbers
              wrapLines
              lineProps={(lineNumber) => {
                const line = rightLines[lineNumber - 1];
                const shouldHighlight = shouldHighlightLine(line, false);
                return {
                  style: {
                    backgroundColor: shouldHighlight ? 'rgba(34, 197, 94, 0.1)' : undefined,
                    display: 'block',
                  },
                };
              }}
            >
              {rightJson}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiffViewer;