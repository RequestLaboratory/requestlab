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
import { formatCurlResponse } from './utils/curlUtils';

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

  // Handle mode change
  const handleModeChange = (newMode: ComparisonMode) => {
    setMode(newMode);
    // When switching from curl to json mode, populate JSON inputs with curl responses
    if (newMode === 'json' && (leftResponse || rightResponse)) {
      if (leftResponse) {
        updateLeftJson(formatCurlResponse(leftResponse));
      }
      if (rightResponse) {
        updateRightJson(formatCurlResponse(rightResponse));
      }
    }
  };

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
          
          {/* SEO content - hidden from users but visible to crawlers */}
          <div className="sr-only" aria-hidden="true">
            <h2>JSON Diff & Compare Tool - #1 JSON Comparison Tool</h2>
            <p>Best free online JSON diff and compare tool for developers. Compare JSON objects, API responses, and cURL outputs with instant difference highlighting. The most accurate and fastest JSON comparison tool available.</p>
            
            <h3>Why Choose Our JSON Diff Tool?</h3>
            <ul>
              <li>Fastest JSON comparison engine with instant results</li>
              <li>Most accurate JSON diff algorithm for precise comparison</li>
              <li>Advanced cURL response comparison for API testing</li>
              <li>Intuitive difference visualization with color coding</li>
              <li>Share comparison results via unique, secure URLs</li>
              <li>Support for both JSON and cURL input formats</li>
              <li>Dark mode support for reduced eye strain</li>
              <li>Responsive design for all devices</li>
            </ul>

            <h3>JSON Diff Use Cases</h3>
            <ul>
              <li>Compare JSON objects and find differences instantly</li>
              <li>Diff JSON responses from different API versions</li>
              <li>Compare and validate JSON schemas</li>
              <li>Test API endpoints with cURL commands</li>
              <li>Compare JSON data during migration</li>
              <li>Review JSON changes in code reviews</li>
            </ul>

            <h3>Advanced JSON Compare Features</h3>
            <ul>
              <li>Deep JSON comparison with nested object support</li>
              <li>Real-time JSON diff visualization</li>
              <li>cURL command execution and response comparison</li>
              <li>JSON formatting and validation</li>
              <li>Secure URL sharing with encoded parameters</li>
              <li>Cross-browser compatibility</li>
            </ul>

            <p>#1 JSON diff and compare tool for developers. Compare JSON objects, API responses, and cURL outputs with ease. No installation required, works directly in your browser. Share your JSON comparison results with team members using unique URLs. Supports both light and dark themes for comfortable viewing. The most accurate and fastest JSON comparison tool available online.</p>

            <h3>Top Search Terms</h3>
            <p>json diff, json compare, JSON difference checker, JSON comparison tool, JSON diff tool, compare JSON objects, JSON structure comparison, JSON visualization tool, API response comparison, cURL response diff, JSON schema comparison, online JSON diff, JSON data comparison, API testing tool, JSON validation tool</p>

            <h3>JSON Diff Tool Benefits</h3>
            <ul>
              <li>Save time with instant JSON comparison</li>
              <li>Reduce errors in API testing</li>
              <li>Simplify JSON debugging process</li>
              <li>Improve code review efficiency</li>
              <li>Enhance API development workflow</li>
            </ul>
          </div>
        </div>

        <ModeSwitcher mode={mode} onModeChange={handleModeChange} />
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