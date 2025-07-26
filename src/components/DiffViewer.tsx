import React, { useState } from 'react';
import { JsonDiff } from '../types';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Expand, X, Copy, Check } from 'lucide-react';

interface DiffViewerProps {
  diff: JsonDiff | null;
  error?: string;
  leftJson?: string;
  rightJson?: string;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ diff, error, leftJson, rightJson }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedLeft, setCopiedLeft] = useState(false);
  const [copiedRight, setCopiedRight] = useState(false);

  const handleCopy = (text: string, isLeft: boolean) => {
    navigator.clipboard.writeText(text);
    if (isLeft) {
      setCopiedLeft(true);
      setTimeout(() => setCopiedLeft(false), 2000);
    } else {
      setCopiedRight(true);
      setTimeout(() => setCopiedRight(false), 2000);
    }
  };

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

  // Function to get value differences
  const getValueDifferences = (obj1: any, obj2: any, prefix: string = ''): Set<string> => {
    const differences = new Set<string>();
    
    if (typeof obj1 === 'object' && obj1 !== null && typeof obj2 === 'object' && obj2 !== null) {
      Object.keys(obj1).forEach(key => {
        const fieldName = prefix ? `${prefix}.${key}` : key;
        
        if (key in obj2) {
          if (typeof obj1[key] === 'object' && obj1[key] !== null && 
              typeof obj2[key] === 'object' && obj2[key] !== null) {
            const nestedDiffs = getValueDifferences(obj1[key], obj2[key], fieldName);
            nestedDiffs.forEach(diff => differences.add(diff));
          } else if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
            differences.add(fieldName);
          }
        }
      });
    }
    
    return differences;
  };

  // Get all fields from both JSONs
  const leftFields = new Set(getAllFields(leftObj));
  const rightFields = new Set(getAllFields(rightObj));

  // Find field differences
  const onlyInLeft = new Set([...leftFields].filter(x => !rightFields.has(x)));
  const onlyInRight = new Set([...rightFields].filter(x => !leftFields.has(x)));

  // Find value differences
  const valueDifferences = getValueDifferences(leftObj, rightObj);

  // Function to check if a line should be highlighted
  const shouldHighlightLine = (line: string, isLeft: boolean): { fieldDiff: boolean; valueDiff: boolean } => {
    const fieldMatch = line.match(/^\s*"([^"]+)"\s*:/);
    if (!fieldMatch) return { fieldDiff: false, valueDiff: false };

    const fieldName = fieldMatch[1];
    const differences = isLeft ? onlyInLeft : onlyInRight;
    
    // Check if this field name is in the differences
    const isFieldDiff = Array.from(differences).some(path => {
      const lastField = path.split('.').pop();
      return lastField === fieldName;
    });

    // Check if this field has a value difference
    const isValueDiff = Array.from(valueDifferences).some(path => {
      const lastField = path.split('.').pop();
      return lastField === fieldName;
    });

    return { fieldDiff: isFieldDiff, valueDiff: isValueDiff };
  };

  // Get response status from the response object
  const getResponseStatus = (obj: any): string => {
    if (obj?.status) {
      return `Status: ${obj.status}`;
    }
    return '';
  };

  const renderPanel = (json: string, isLeft: boolean, lines: string[]) => (
    <div className="relative h-full">
      <div className="absolute top-0 left-0 right-0 bg-gray-100 dark:bg-gray-700 p-2 rounded-t-md border-b border-gray-200 dark:border-gray-600">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isLeft ? 'Original' : 'Modified'}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {getResponseStatus(isLeft ? leftObj : rightObj)}
            </span>
            <button
              onClick={() => handleCopy(json, isLeft)}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
              title="Copy JSON"
            >
              {isLeft ? (
                copiedLeft ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />
              ) : (
                copiedRight ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="mt-10 h-[calc(100%-2.5rem)] pt-10">
        <SyntaxHighlighter
          language="json"
          style={vs2015}
          customStyle={{
            margin: 0,
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            lineHeight: '1.5rem',
            height: '100%',
          }}
          showLineNumbers
          wrapLines
          lineProps={(lineNumber) => {
            const line = lines[lineNumber - 1];
            const { fieldDiff, valueDiff } = shouldHighlightLine(line, isLeft);
            return {
              style: {
                backgroundColor: fieldDiff ? (isLeft ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)') : 
                               valueDiff ? 'rgba(156, 163, 175, 0.1)' : undefined,
                display: 'block',
              },
            };
          }}
        >
          {json}
        </SyntaxHighlighter>
      </div>
    </div>
  );

  return (
    <>
      <div className="h-full bg-white dark:bg-gray-800 rounded-md shadow-inner border border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="font-medium text-xl text-gray-800 dark:text-white">Field Name Differences</div>
          <button
            onClick={() => setIsExpanded(true)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
            title="Expand view"
          >
            <Expand className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0 overflow-y-auto p-4 pb-16">
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="h-full">
                {renderPanel(leftJson, true, leftLines)}
              </div>
              <div className="h-full">
                {renderPanel(rightJson, false, rightLines)}
              </div>
            </div>
          </div>

          {/* Color Coding Legend - Sticky to Scroll Area */}
          <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-gray-400 py-3">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-sm bg-red-500/10 mr-2"></div>
                <span>Fields missing in right JSON</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-sm bg-green-500/10 mr-2"></div>
                <span>New fields in right JSON</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-sm bg-gray-500/10 mr-2"></div>
                <span>Different values</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="relative w-full h-full max-w-7xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col">
            <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="font-medium text-xl text-gray-800 dark:text-white">Field Name Differences</div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                title="Close expanded view"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-4 h-full">
                <div className="h-full">
                  {renderPanel(leftJson, true, leftLines)}
                </div>
                <div className="h-full">
                  {renderPanel(rightJson, false, rightLines)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DiffViewer;