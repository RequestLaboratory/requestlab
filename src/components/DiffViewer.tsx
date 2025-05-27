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

  const leftLines = leftJson.split('\n');
  const rightLines = rightJson.split('\n');

  const isFieldNameLine = (line: string): boolean => {
    // Check if the line contains a field name (key) in JSON
    return /^\s*"[^"]+"\s*:/.test(line);
  };

  const getFieldNameFromLine = (line: string): string | null => {
    const match = line.match(/^\s*"([^"]+)"\s*:/);
    return match ? match[1] : null;
  };

  const shouldHighlightLine = (line: string, otherLines: string[]): boolean => {
    if (!isFieldNameLine(line)) return false;
    
    const fieldName = getFieldNameFromLine(line);
    if (!fieldName) return false;

    // Check if this field name exists in the other JSON
    return !otherLines.some(otherLine => {
      const otherFieldName = getFieldNameFromLine(otherLine);
      return otherFieldName === fieldName;
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
                const shouldHighlight = shouldHighlightLine(line, rightLines);
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
                const shouldHighlight = shouldHighlightLine(line, leftLines);
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