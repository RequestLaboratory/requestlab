import React, { useState, useEffect } from 'react';
import { useJsonComparison } from './hooks/useJsonComparison';
import { useCurlComparison } from './hooks/useCurlComparison';
import JsonInput from './components/JsonInput';
import CurlInput from './components/CurlInput';
import DiffViewer from './components/DiffViewer';
import ShareLink from './components/ShareLink';
import ExampleButton from './components/ExampleButton';
import ModeSwitcher, { ComparisonMode } from './components/ModeSwitcher';
import Layout from './components/Layout';
import { decodeJsonFromUrl } from './utils/urlUtils';

const leftExample = JSON.stringify({
  name: "Product A",
  price: 19.99,
  features: ["Fast", "Reliable", "Eco-friendly"],
  details: {
    weight: "2kg",
    dimensions: {
      width: 10,
      height: 5,
      depth: 3
    },
    material: "Aluminum"
  },
  inStock: true,
  tags: ["electronics", "home"]
}, null, 2);

const rightExample = JSON.stringify({
  name: "Product B",
  price: 24.99,
  features: ["Fast", "Durable", "Eco-friendly"],
  details: {
    weight: "2.5kg",
    dimensions: {
      width: 10,
      height: 6,
      depth: 3
    },
    material: "Steel",
    warranty: "2 years"
  },
  inStock: true,
  tags: ["electronics", "office", "premium"]
}, null, 2);

function App() {
  const [mode, setMode] = useState<ComparisonMode>('json');
  
  const jsonComparison = useJsonComparison();
  const curlComparison = useCurlComparison();

  const {
    leftInput: jsonLeftInput,
    rightInput: jsonRightInput,
    diff: jsonDiff,
    error: jsonError,
    leftValid,
    rightValid,
    updateLeftJson,
    updateRightJson,
    formatLeftJson,
    formatRightJson,
  } = jsonComparison;

  const {
    leftInput: curlLeftInput,
    rightInput: curlRightInput,
    leftResponse,
    rightResponse,
    diff: curlDiff,
    error: curlError,
    isLeftLoading,
    isRightLoading,
    setLeftInput: setCurlLeftInput,
    setRightInput: setCurlRightInput,
    executeLeftCurl,
    executeRightCurl,
  } = curlComparison;

  // Load data from URL on initial render
  useEffect(() => {
    const data = decodeJsonFromUrl();
    if (data.mode) {
      setMode(data.mode);
    }
    if (data.leftJson) {
      updateLeftJson(data.leftJson);
    }
    if (data.rightJson) {
      updateRightJson(data.rightJson);
    }
    if (data.mode === 'curl') {
      if (data.leftCurl) {
        setCurlLeftInput(data.leftCurl);
      }
      if (data.rightCurl) {
        setCurlRightInput(data.rightCurl);
      }
    }
  }, []);

  const handleLeftExample = () => {
    if (mode === 'json') {
      updateLeftJson(leftExample);
    } else {
      setCurlLeftInput('curl -X GET "https://api.example.com/data" -H "Content-Type: application/json"');
    }
  };

  const handleRightExample = () => {
    if (mode === 'json') {
      updateRightJson(rightExample);
    } else {
      setCurlRightInput('curl -X GET "https://api.example.com/data" -H "Content-Type: application/json" -H "Authorization: Bearer token123"');
    }
  };

  return (
    <Layout>
      <div className="animate-fadeIn">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
            JSON Difference Viewer
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Compare two JSON objects or cURL responses side by side, visualize the differences, and share the results with a unique URL.
          </p>
        </div>

        <ModeSwitcher mode={mode} onModeChange={setMode} />
        <ExampleButton onLeftExample={handleLeftExample} onRightExample={handleRightExample} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 h-80 md:h-96 overflow-hidden">
            {mode === 'json' ? (
              <JsonInput
                value={jsonLeftInput}
                onChange={updateLeftJson}
                onFormat={formatLeftJson}
                isValid={leftValid}
                label="Left JSON"
                placeholder="Paste your JSON here..."
              />
            ) : (
              <CurlInput
                value={curlLeftInput}
                onChange={setCurlLeftInput}
                onExecute={executeLeftCurl}
                isLoading={isLeftLoading}
                label="Left cURL"
                placeholder="Enter your cURL command here..."
              />
            )}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 h-80 md:h-96 overflow-hidden">
            {mode === 'json' ? (
              <JsonInput
                value={jsonRightInput}
                onChange={updateRightJson}
                onFormat={formatRightJson}
                isValid={rightValid}
                label="Right JSON"
                placeholder="Paste your JSON here..."
              />
            ) : (
              <CurlInput
                value={curlRightInput}
                onChange={setCurlRightInput}
                onExecute={executeRightCurl}
                isLoading={isRightLoading}
                label="Right cURL"
                placeholder="Enter your cURL command here..."
              />
            )}
          </div>
        </div>

        <ShareLink 
          leftJson={mode === 'json' ? jsonLeftInput : leftResponse} 
          rightJson={mode === 'json' ? jsonRightInput : rightResponse} 
          leftCurl={mode === 'curl' ? curlLeftInput : ''}
          rightCurl={mode === 'curl' ? curlRightInput : ''}
          mode={mode}
          isValid={mode === 'json' ? (leftValid && rightValid && !!jsonLeftInput && !!jsonRightInput) : (!!leftResponse && !!rightResponse)} 
        />

        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="h-[calc(100vh-600px)] min-h-[400px] overflow-y-auto">
            <DiffViewer 
              diff={mode === 'json' ? jsonDiff : curlDiff} 
              error={mode === 'json' ? jsonError : curlError} 
              leftJson={mode === 'json' ? jsonLeftInput : leftResponse}
              rightJson={mode === 'json' ? jsonRightInput : rightResponse}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default App;