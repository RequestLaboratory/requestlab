import React from 'react';
import { useJsonComparison } from './hooks/useJsonComparison';
import JsonInput from './components/JsonInput';
import DiffViewer from './components/DiffViewer';
import ShareLink from './components/ShareLink';
import ExampleButton from './components/ExampleButton';
import Layout from './components/Layout';

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
  const {
    leftInput,
    rightInput,
    diff,
    error,
    leftValid,
    rightValid,
    updateLeftJson,
    updateRightJson,
    formatLeftJson,
    formatRightJson,
  } = useJsonComparison();

  const handleLeftExample = () => {
    updateLeftJson(leftExample);
  };

  const handleRightExample = () => {
    updateRightJson(rightExample);
  };

  return (
    <Layout>
      <div className="animate-fadeIn">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
            JSON Difference Viewer
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Compare two JSON objects side by side, visualize the differences, and share the results with a unique URL.
          </p>
        </div>

        <ExampleButton onLeftExample={handleLeftExample} onRightExample={handleRightExample} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 h-80 md:h-96 overflow-hidden">
            <JsonInput
              value={leftInput}
              onChange={updateLeftJson}
              onFormat={formatLeftJson}
              isValid={leftValid}
              label="Left JSON"
              placeholder="Paste your JSON here..."
            />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 h-80 md:h-96 overflow-hidden">
            <JsonInput
              value={rightInput}
              onChange={updateRightJson}
              onFormat={formatRightJson}
              isValid={rightValid}
              label="Right JSON"
              placeholder="Paste your JSON here..."
            />
          </div>
        </div>

        <ShareLink 
          leftJson={leftInput} 
          rightJson={rightInput} 
          isValid={leftValid && rightValid && !!leftInput && !!rightInput} 
        />

        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="h-[calc(100vh-600px)] min-h-[400px] overflow-y-auto">
            <DiffViewer 
              diff={diff} 
              error={error || undefined} 
              leftJson={leftInput}
              rightJson={rightInput}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default App