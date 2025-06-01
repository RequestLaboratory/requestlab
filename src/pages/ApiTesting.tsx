import React, { useState, useEffect, useRef } from 'react';
import { executeApiRequest } from '../utils/apiTestingUtils';
import { parseCurlCommand } from '../utils/curlParser';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Copy, Check, Expand, X, Terminal, Play, StopCircle, BarChart2 } from 'lucide-react';
import { TextField, Box, Typography, Tabs, Tab } from '@mui/material';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  TimeScale,
  TimeSeriesScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  TimeSeriesScale
);

interface RequestDetails {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
  queryParams: Record<string, string>;
}

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: string | Record<string, unknown>;
  time: number;
  size: number;
}

interface LoadTestConfig {
  numUsers: number;
  requestsPerMinute: number;
}

interface LoadTestResult {
  id: number;
  userId: number;
  startTime: string;
  endTime: string;
  duration: number;
  status: number;
  statusText: string;
  responseSize: number;
  error?: string;
  connectionInfo?: {
    keepAlive: boolean;
    protocol: string;
    host: string;
  };
}

interface TrendData {
  datasets: {
    label: string;
    data: { x: Date; y: number }[];
    borderColor: string;
    backgroundColor: string;
    borderWidth?: number;
    pointBackgroundColor?: string;
    pointBorderColor?: string;
    pointHoverBackgroundColor?: string;
    pointHoverBorderColor?: string;
  }[];
}

// Add ErrorBoundary component at the top of the file
class ChartErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chart Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-900/30 rounded-lg">
          <p className="text-red-400">Error loading chart. Please try again.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

const ApiTesting: React.FC = () => {
  const [requestDetails, setRequestDetails] = useState<RequestDetails>(() => {
    const savedState = sessionStorage.getItem('apiTestingState');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      return {
        method: parsed.method || 'GET',
        url: parsed.url || '',
        headers: parsed.headers || { 'header-1': '' },
        body: parsed.body || '',
        queryParams: parsed.queryParams || {}
      };
    }
    // Default GitHub API example
    return {
      method: 'GET',
      url: 'https://api.github.com/repos/vuejs/vue',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'RequestLab'
      },
      body: '',
      queryParams: {}
    };
  });

  const [response, setResponse] = useState<ApiResponse | null>(() => {
    const savedResponse = sessionStorage.getItem('apiTestingResponse');
    return savedResponse ? JSON.parse(savedResponse) : null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body' | 'pre-request' | 'tests' | 'load-test'>(() => {
    const savedTab = sessionStorage.getItem('apiTestingActiveTab');
    return (savedTab as any) || 'headers';
  });
  const [bodyType, setBodyType] = useState<'none' | 'raw' | 'form-data' | 'x-www-form-urlencoded'>(() => {
    const savedBodyType = sessionStorage.getItem('apiTestingBodyType');
    return (savedBodyType as any) || 'none';
  });
  const [contentType, setContentType] = useState(() => {
    const savedContentType = sessionStorage.getItem('apiTestingContentType');
    return savedContentType || 'application/json';
  });
  const [isResponsePanelVisible, setIsResponsePanelVisible] = useState(() => {
    const savedVisibility = sessionStorage.getItem('apiTestingResponseVisible');
    return savedVisibility ? JSON.parse(savedVisibility) : true;
  });
  const [copied, setCopied] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [isResponseExpanded, setIsResponseExpanded] = useState(false);
  
  // Load testing states
  const [loadTestConfig, setLoadTestConfig] = useState<LoadTestConfig>({
    numUsers: 10,
    requestsPerMinute: 60
  });
  const [loadTestResults, setLoadTestResults] = useState<LoadTestResult[]>([]);
  const [isLoadTestRunning, setIsLoadTestRunning] = useState(false);
  const [loadTestError, setLoadTestError] = useState<string | null>(null);
  const [shouldStopLoadTest, setShouldStopLoadTest] = useState(false);
  
  // Use a ref to store active controllers to avoid dependency issues in useEffect
  const activeRequestsRef = useRef<AbortController[]>([]);
  // Use a ref to track the stop signal for immediate access in async functions
  const stopSignalRef = useRef(false);

  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [resultTab, setResultTab] = useState(0);

  // Add chart refs with proper types
  const lineChartRef = useRef<ChartJS<'line', { x: Date; y: number }[]> | null>(null);
  const barChartRef = useRef<ChartJS<'bar'> | null>(null);

  const [isChartExpanded, setIsChartExpanded] = useState(false);
  const [expandedChartType, setExpandedChartType] = useState<'line' | 'bar' | null>(null);

  // Save state to session storage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('apiTestingState', JSON.stringify(requestDetails));
  }, [requestDetails]);

  useEffect(() => {
    if (response) {
      sessionStorage.setItem('apiTestingResponse', JSON.stringify(response));
    }
  }, [response]);

  useEffect(() => {
    sessionStorage.setItem('apiTestingActiveTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    sessionStorage.setItem('apiTestingBodyType', bodyType);
  }, [bodyType]);

  useEffect(() => {
    sessionStorage.setItem('apiTestingContentType', contentType);
  }, [contentType]);

  useEffect(() => {
    sessionStorage.setItem('apiTestingResponseVisible', JSON.stringify(isResponsePanelVisible));
  }, [isResponsePanelVisible]);

  // Update ref when shouldStopLoadTest changes
  useEffect(() => {
    stopSignalRef.current = shouldStopLoadTest;
    
    if (shouldStopLoadTest) {
      // Abort all active requests when stop is requested
      abortAllRequests();
    }
  }, [shouldStopLoadTest]);

  // Cleanup function for when component unmounts
  useEffect(() => {
    return () => {
      abortAllRequests();
    };
  }, []);

  // Function to abort all active requests
  const abortAllRequests = () => {
    // Get controllers from ref to ensure we have the latest
    const controllers = activeRequestsRef.current;
    
    // Abort each controller
    controllers.forEach(controller => {
      try {
        if (controller.signal && !controller.signal.aborted) {
          controller.abort();
        }
      } catch (error) {
        console.error('Error aborting request:', error);
      }
    });
    
    // Clear the controllers array
    activeRequestsRef.current = [];
    
    // Set running state to false
    setIsLoadTestRunning(false);
  };

  const handleSendRequest = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const startTime = Date.now();
      const result = await executeApiRequest({
        url: requestDetails.url,
        method: requestDetails.method,
        headers: {
          ...requestDetails.headers,
          'Content-Type': contentType
        },
        body: requestDetails.body || undefined,
        followRedirects: true
      });
      const endTime = Date.now();

      if (result.error) {
        setError(result.error);
        return;
      }
      
      const responseData = result.data as { response: unknown; status: number; headers: Record<string, string> };
      setResponse({
        status: responseData.status,
        statusText: '',
        headers: responseData.headers,
        data: responseData.response as string | Record<string, unknown>,
        time: endTime - startTime,
        size: typeof responseData.response === 'string' 
          ? responseData.response.length 
          : JSON.stringify(responseData.response).length
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to execute request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    
    // Check if the pasted text looks like a cURL command
    if (pastedText.trim().toLowerCase().startsWith('curl')) {
      try {
        const parsedCurl = parseCurlCommand(pastedText);
        
        // Update all fields based on the parsed cURL
        setRequestDetails(prev => ({
          ...prev,
          method: parsedCurl.method || 'GET',
          url: parsedCurl.url || '',
          headers: parsedCurl.headers || {},
          body: parsedCurl.body || '',
          queryParams: parsedCurl.queryParams || {}
        }));
        
        // Convert headers array to the format we use
        const newHeaders = Object.entries(parsedCurl.headers).map(([key, value]) => ({
          key,
          value: value as string
        }));
        setRequestDetails(prev => ({
          ...prev,
          headers: newHeaders.reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {})
        }));
        
        // Set body type if present
        if (parsedCurl.body) {
          setBodyType('raw');
          
          // Try to detect content type from headers
          const contentTypeHeader = newHeaders.find(h => 
            h.key.toLowerCase() === 'content-type'
          );
          if (contentTypeHeader) {
            setContentType(contentTypeHeader.value);
          }
        }
        
        // Prevent the default paste behavior
        e.preventDefault();
      } catch (err) {
        console.error('Failed to parse cURL command:', err);
        // If parsing fails, allow normal paste behavior
      }
    }
  };

  const handleMethodChange = (method: string) => {
    setRequestDetails(prev => ({ ...prev, method }));
  };

  const handleUrlChange = (url: string) => {
    setRequestDetails(prev => ({ ...prev, url }));
  };

  const handleHeaderChange = (key: string, value: string) => {
    setRequestDetails(prev => ({
      ...prev,
      headers: { ...prev.headers, [key]: value }
    }));
  };

  const handleBodyChange = (body: string) => {
    setRequestDetails(prev => ({ ...prev, body }));
  };

  const handleQueryParamChange = (key: string, value: string) => {
    setRequestDetails(prev => ({
      ...prev,
      queryParams: { ...prev.queryParams, [key]: value }
    }));
  };

  const handleCopyResponse = () => {
    const responseText = typeof response?.data === 'string'
      ? response.data
      : JSON.stringify(response?.data, null, 2);
    navigator.clipboard.writeText(responseText);
    setCopied(true);
    setCopyMessage('Response copied to clipboard');
    setTimeout(() => {
      setCopied(false);
      setCopyMessage(null);
    }, 2000);
  };

  const handleCopyCurl = () => {
    // Build the cURL command
    let curlCommand = `curl '${requestDetails.url}' \\\n`;
    
    // Add method if not GET
    if (requestDetails.method !== 'GET') {
      curlCommand += `  -X ${requestDetails.method} \\\n`;
    }
    
    // Add headers
    Object.entries(requestDetails.headers).forEach(([key, value]) => {
      if (key && value) {
        curlCommand += `  -H '${key}: ${value}' \\\n`;
      }
    });
    
    // Add body if present
    if (requestDetails.body) {
      curlCommand += `  -d '${requestDetails.body}' \\\n`;
    }
    
    // Remove trailing backslash and newline
    curlCommand = curlCommand.slice(0, -3);
    
    // Copy to clipboard
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setCopyMessage('cURL command copied to clipboard');
    setTimeout(() => {
      setCopied(false);
      setCopyMessage(null);
    }, 2000);
  };

  const handleLoadTestConfigChange = (field: keyof LoadTestConfig, value: number) => {
    setLoadTestConfig(prev => ({ ...prev, [field]: value }));
  };

  const stopLoadTest = () => {
    setShouldStopLoadTest(true);
    stopSignalRef.current = true;
    abortAllRequests();
    
    // Cleanup charts before resetting data
    if (lineChartRef.current) {
      lineChartRef.current.destroy();
    }
    if (barChartRef.current) {
      barChartRef.current.destroy();
    }
    
    setTrendData(null);
  };

  const runLoadTest = async () => {
    // Reset state before starting
    setIsLoadTestRunning(true);
    setLoadTestError(null);
    setLoadTestResults([]);
    setShouldStopLoadTest(false);
    stopSignalRef.current = false;
    activeRequestsRef.current = [];
    
    let requestId = 1;

    const vus = loadTestConfig.numUsers;
    const requestsPerMinute = loadTestConfig.requestsPerMinute;
    const thinkTime = (60 * 1000) / requestsPerMinute;

    const executeRequest = async (vuId: number, iteration: number): Promise<LoadTestResult> => {
      // Check stop signal first
      if (stopSignalRef.current) {
        return {
          id: requestId++,
          userId: vuId,
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          duration: 0,
          status: 0,
          statusText: 'Cancelled',
          responseSize: 0,
          error: 'Test stopped by user'
        };
      }

      const startTime = new Date();
      const controller = new AbortController();
      
      // Add to active controllers ref
      activeRequestsRef.current.push(controller);

      try {
        // Check again before executing the request
        if (stopSignalRef.current) {
          controller.abort();
          throw new Error('Test stopped by user');
        }

        // Add cache control headers and unique parameter
        const headers = {
          ...requestDetails.headers,
          'Content-Type': contentType,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        };

        // Add unique parameter to prevent caching
        const url = new URL(requestDetails.url);
        url.searchParams.append('_t', `${Date.now()}_${vuId}_${iteration}`);

        const result = await executeApiRequest({
          url: url.toString(),
          method: requestDetails.method,
          headers,
          body: requestDetails.body || undefined,
          followRedirects: true,
          signal: controller.signal
        });

        const endTime = new Date();
        const duration = endTime.getTime() - startTime.getTime();

        // Remove controller from active list
        activeRequestsRef.current = activeRequestsRef.current.filter(c => c !== controller);

        // Check if test was stopped during request
        if (stopSignalRef.current) {
          return {
            id: requestId++,
            userId: vuId,
            startTime: startTime.toISOString(),
            endTime: new Date().toISOString(),
            duration: new Date().getTime() - startTime.getTime(),
            status: 0,
            statusText: 'Cancelled',
            responseSize: 0,
            error: 'Test stopped by user'
          };
        }

        if (result.error) {
          return {
            id: requestId++,
            userId: vuId,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            duration,
            status: 0,
            statusText: 'Error',
            responseSize: 0,
            error: result.error
          };
        }

        const responseData = result.data as { response: unknown; status: number; headers: Record<string, string> };
        return {
          id: requestId++,
          userId: vuId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          duration,
          status: responseData.status,
          statusText: '',
          responseSize: typeof responseData.response === 'string' 
            ? responseData.response.length 
            : JSON.stringify(responseData.response).length,
          connectionInfo: {
            keepAlive: responseData.headers['connection']?.toLowerCase() === 'keep-alive',
            protocol: url.protocol,
            host: url.host
          }
        };
      } catch (e) {
        // Remove controller from active list
        activeRequestsRef.current = activeRequestsRef.current.filter(c => c !== controller);

        // Handle AbortError specially
        if (e instanceof Error && e.name === 'AbortError') {
          return {
            id: requestId++,
            userId: vuId,
            startTime: startTime.toISOString(),
            endTime: new Date().toISOString(),
            duration: new Date().getTime() - startTime.getTime(),
            status: 0,
            statusText: 'Aborted',
            responseSize: 0,
            error: 'Request aborted'
          };
        }

        const endTime = new Date();
        return {
          id: requestId++,
          userId: vuId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          duration: endTime.getTime() - startTime.getTime(),
          status: 0,
          statusText: 'Error',
          responseSize: 0,
          error: e instanceof Error ? e.message : 'Failed to execute request'
        };
      }
    };

    // Function to run a single VU
    const runVU = async (vuId: number): Promise<void> => {
      let iteration = 0;
      
      while (iteration < requestsPerMinute && !stopSignalRef.current) {
        // Check stop signal before each request
        if (stopSignalRef.current) {
          break;
        }
        
        const result = await executeRequest(vuId, iteration);
        
        // Don't add results if test was stopped
        if (!stopSignalRef.current) {
          setLoadTestResults(prev => [...prev, result]);
        }
        
        // Add think time between iterations, but check for stop condition
        if (!stopSignalRef.current) {
          try {
            await new Promise<void>((resolve, reject) => {
              const timeoutId = setTimeout(() => {
                resolve();
              }, thinkTime);
              
              // Setup a watcher for the stop signal
              const checkInterval = setInterval(() => {
                if (stopSignalRef.current) {
                  clearTimeout(timeoutId);
                  clearInterval(checkInterval);
                  resolve();
                }
              }, 100); // Check every 100ms
              
              // Cleanup both timers if normal resolution
              setTimeout(() => {
                clearInterval(checkInterval);
              }, thinkTime + 50);
            });
          } catch (error) {
            // Just continue if think time is interrupted
          }
        }
        
        // Check stop signal again after waiting
        if (stopSignalRef.current) {
          break;
        }
        
        iteration++;
      }
    };

    try {
      // Start all VUs concurrently
      const vuPromises = Array.from({ length: vus }, (_, i) => runVU(i + 1));
      await Promise.all(vuPromises);
    } catch (error) {
      console.error('Load test error:', error);
      setLoadTestError(error instanceof Error ? error.message : 'Failed to run load test');
    } finally {
      // Ensure we reset state properly
      if (!isLoadTestRunning) {
        // Already stopped by user
        return;
      }
      
      setIsLoadTestRunning(false);
      if (stopSignalRef.current) {
        // Add a message about the test being stopped
        setLoadTestResults(prev => [
          ...prev,
          {
            id: requestId++,
            userId: 0,
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            duration: 0,
            status: 0,
            statusText: 'Stopped',
            responseSize: 0,
            error: 'Load test stopped by user'
          }
        ]);
      }
    }
  };

  // Function to prepare trend data
  const prepareTrendData = () => {
    if (!loadTestResults.length) return null;

    const successResults = loadTestResults.filter(r => r.status >= 200 && r.status < 300);
    const failureResults = loadTestResults.filter(r => r.status >= 400);
    const cancelledResults = loadTestResults.filter(r => r.statusText === 'Cancelled');

    // Group results by user
    const userGroups = loadTestResults.reduce((acc, result) => {
      if (!acc[result.userId]) {
        acc[result.userId] = [];
      }
      acc[result.userId].push(result);
      return acc;
    }, {} as Record<number, LoadTestResult[]>);

    // Chart.js default colors
    const colors = [
      'rgb(54, 162, 235)',   // Blue
      'rgb(75, 192, 192)',   // Teal
      'rgb(255, 99, 132)',   // Red
      'rgb(255, 159, 64)',   // Orange
      'rgb(153, 102, 255)',  // Purple
      'rgb(255, 205, 86)',   // Yellow
      'rgb(201, 203, 207)',  // Gray
      'rgb(255, 99, 255)'    // Pink
    ];

    // Prepare time series data using Chart.js colors
    const datasets = Object.entries(userGroups).map(([userId, results], index) => {
      const colorIndex = index % colors.length;
      const color = colors[colorIndex];
      return {
        label: `User ${userId}`,
        data: results.map(r => ({
          x: new Date(r.startTime),
          y: r.duration
        })),
        borderColor: color,
        backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
        borderWidth: 2,
        pointBackgroundColor: 'white',
        pointBorderColor: color,
        pointHoverBackgroundColor: 'white',
        pointHoverBorderColor: color,
        tension: 0.4,
        fill: true
      };
    });

    return {
      datasets,
    };
  };

  // Function to prepare success/failure distribution
  const prepareDistributionData = () => {
    if (!loadTestResults.length) return null;

    const successCount = loadTestResults.filter(r => r.status >= 200 && r.status < 300).length;
    const failureCount = loadTestResults.filter(r => r.status >= 400).length;
    const cancelledCount = loadTestResults.filter(r => r.statusText === 'Cancelled').length;

    return {
      labels: ['Success', 'Failure', 'Cancelled'],
      datasets: [{
        label: 'Request Distribution',
        data: [successCount, failureCount, cancelledCount],
        backgroundColor: [
          'rgba(34, 197, 94, 0.6)',  // green
          'rgba(239, 68, 68, 0.6)',  // red
          'rgba(156, 163, 175, 0.6)', // gray
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
          'rgb(156, 163, 175)',
        ],
        borderWidth: 1,
      }],
    };
  };

  // Update trend data when results change
  useEffect(() => {
    if (loadTestResults.length > 0) {
      const newTrendData = prepareTrendData();
      if (newTrendData) {
        setTrendData(newTrendData);
      }
    } else {
      setTrendData(null);
    }
  }, [loadTestResults]);

  // Define chart options before using them
  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'white',
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12,
            weight: 'normal' as const
          }
        },
      },
      title: {
        display: true,
        text: 'Response Time Trend',
        color: 'white',
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: 20,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}ms`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'white',
          padding: 10,
          callback: function(value) {
            return value + 'ms';
          }
        },
        title: {
          display: true,
          text: 'Response Time (ms)',
          color: 'white',
          font: {
            size: 12,
          },
        },
      },
      x: {
        type: 'time',
        time: {
          unit: 'second',
          displayFormats: {
            second: 'HH:mm:ss'
          },
          tooltipFormat: 'HH:mm:ss'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'white',
          padding: 10,
          maxRotation: 45,
          minRotation: 45,
          source: 'auto',
          autoSkip: true,
          maxTicksLimit: 10
        },
        title: {
          display: true,
          text: 'Time',
          color: 'white',
          font: {
            size: 12,
          },
        },
      },
    },
    elements: {
      line: {
        borderWidth: 2,
        tension: 0.4,
      },
      point: {
        radius: 3,
        hoverRadius: 5,
        borderWidth: 2,
      },
    },
  };

  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'white',
        },
      },
      title: {
        display: true,
        text: 'Request Distribution',
        color: 'white',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'white',
        },
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'white',
        },
      },
    },
  };

  // Function to download results as CSV
  const downloadResultsAsCSV = () => {
    if (!loadTestResults.length) return;

    // Define CSV headers
    const headers = [
      'Request ID',
      'User ID',
      'Method',
      'URL',
      'Start Time',
      'End Time',
      'Duration (ms)',
      'Status',
      'Response Size',
      'Connection Info',
      'Error'
    ];

    // Convert results to CSV rows
    const rows = loadTestResults.map(result => [
      result.id,
      result.userId,
      requestDetails.method,
      requestDetails.url,
      new Date(result.startTime).toLocaleString(),
      new Date(result.endTime).toLocaleString(),
      result.duration,
      result.status || result.statusText,
      result.responseSize,
      result.connectionInfo ? (
        <span className="flex items-center">
          <span className={`w-2 h-2 rounded-full mr-2 ${
            result.connectionInfo.keepAlive ? 'bg-green-500' : 'bg-yellow-500'
          }`} />
          {result.connectionInfo.protocol}//{result.connectionInfo.host}
        </span>
      ) : '-',
      result.error || ''
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `load-test-results-${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Update cleanup effect
  useEffect(() => {
    const cleanupCharts = () => {
      try {
        if (lineChartRef.current) {
          lineChartRef.current.destroy();
        }
        if (barChartRef.current) {
          barChartRef.current.destroy();
        }
      } catch (error) {
        console.error('Error cleaning up charts:', error);
      }
    };

    return cleanupCharts;
  }, []);

  // Update the tab change handler
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    // Cleanup charts when switching tabs
    if (resultTab === 1) { // If leaving the charts tab
      if (lineChartRef.current) {
        lineChartRef.current.destroy();
      }
      if (barChartRef.current) {
        barChartRef.current.destroy();
      }
    }
    setResultTab(newValue);
  };

  const handleMaximizeChart = (chartType: 'line' | 'bar') => {
    setExpandedChartType(chartType);
    setIsChartExpanded(true);
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Top Bar */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
        <select
          value={requestDetails.method}
          onChange={(e) => handleMethodChange(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
        >
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>DELETE</option>
          <option>PATCH</option>
        </select>
        <input
          type="text"
          value={requestDetails.url}
          onChange={(e) => handleUrlChange(e.target.value)}
          onPaste={handleUrlPaste}
          placeholder="Enter Request URL"
          className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
        />
        <button
          onClick={handleSendRequest}
          disabled={isLoading}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
        >
          Send
        </button>
        <button
          onClick={handleCopyCurl}
          className="flex items-center gap-1.5 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-200"
          title="Copy as cURL"
        >
          <Terminal className="w-4 h-4" />
          <span className="text-sm font-medium">Copy cURL</span>
        </button>
        {response && (
          <div className="relative">
            <button
              onClick={() => setIsResponsePanelVisible(!isResponsePanelVisible)}
              className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-200"
            >
              {isResponsePanelVisible ? (
                <>
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                  Hide Response
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                  Show Response
                </>
              )}
            </button>
            {!isResponsePanelVisible && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-orange-500 via-blue-500 to-orange-500 animate-[gradient_2s_ease-in-out_infinite] bg-[length:200%_100%]" />
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Main Request Area */}
        <div className={`flex-1 flex flex-col ${response && isResponsePanelVisible ? 'w-1/2' : 'w-full'}`}>
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-4">
              <button
                onClick={() => setActiveTab('headers')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'headers'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                }`}
              >
                Headers
              </button>
              <button
                onClick={() => setActiveTab('body')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'body'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                }`}
              >
                Body
              </button>
              <button
                onClick={() => setActiveTab('params')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'params'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                }`}
              >
                Params
              </button>
              <button
                onClick={() => setActiveTab('pre-request')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pre-request'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                }`}
              >
                Pre-request Script
              </button>
              <button
                onClick={() => setActiveTab('tests')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tests'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                }`}
              >
                Tests
              </button>
              <button
                onClick={() => setActiveTab('load-test')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'load-test'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                }`}
              >
                Load Test
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 py-4 pl-4 overflow-hidden">
            {activeTab === 'params' && (
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <div className="col-span-4">KEY</div>
                  <div className="col-span-4">VALUE</div>
                  <div className="col-span-4">DESCRIPTION</div>
                </div>
                {Object.entries(requestDetails.queryParams).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-12 gap-4">
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => handleQueryParamChange(e.target.value, value)}
                      className="col-span-4 p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      placeholder="Key"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleQueryParamChange(key, e.target.value)}
                      className="col-span-4 p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      placeholder="Value"
                    />
                    <input
                      type="text"
                      className="col-span-4 p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      placeholder="Description"
                    />
                  </div>
                ))}
                <button
                  onClick={() => handleQueryParamChange('', '')}
                  className="text-orange-500 hover:text-orange-600 dark:text-orange-400"
                >
                  + Add Parameter
                </button>
              </div>
            )}

            {activeTab === 'headers' && (
              <div className="flex flex-col h-[calc(100vh-12rem)]">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                  <div className="col-span-4">KEY</div>
                  <div className="col-span-4">VALUE</div>
                  <div className="col-span-4">DESCRIPTION</div>
                </div>
                <div className="flex-1 overflow-y-auto overflow-x-hidden pr-4 min-h-0">
                  <div className="space-y-4">
                    {Object.entries(requestDetails.headers).map(([key, value], index) => (
                      <div key={index} className="grid grid-cols-12 gap-4">
                        <input
                          type="text"
                          value={key}
                          onChange={(e) => {
                            const newKey = e.target.value;
                            const newHeaders = { ...requestDetails.headers };
                            delete newHeaders[key];
                            newHeaders[newKey] = value;
                            setRequestDetails(prev => ({
                              ...prev,
                              headers: newHeaders
                            }));
                          }}
                          className="col-span-4 p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white truncate"
                          placeholder="Key"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleHeaderChange(key, e.target.value)}
                          className="col-span-4 p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white truncate"
                          placeholder="Value"
                        />
                        <div className="col-span-4 flex items-center">
                          <input
                            type="text"
                            className="flex-1 p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white truncate"
                            placeholder="Description"
                          />
                          <button
                            onClick={() => {
                              const newHeaders = { ...requestDetails.headers };
                              delete newHeaders[key];
                              setRequestDetails(prev => ({
                                ...prev,
                                headers: newHeaders
                              }));
                            }}
                            className="ml-2 p-2 text-red-500 hover:text-red-600 dark:text-red-400 flex-shrink-0"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      const newKey = `header-${Object.keys(requestDetails.headers).length + 1}`;
                      setRequestDetails(prev => ({
                        ...prev,
                        headers: { ...prev.headers, [newKey]: '' }
                      }));
                    }}
                    className="flex items-center text-orange-500 hover:text-orange-600 dark:text-orange-400"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Header
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'body' && (
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setBodyType('raw')}
                    className={`px-3 py-1 text-sm font-medium ${
                      bodyType === 'raw'
                        ? 'text-orange-600 border-b-2 border-orange-500'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    raw
                  </button>
                  <button
                    onClick={() => setBodyType('form-data')}
                    className={`px-3 py-1 text-sm font-medium ${
                      bodyType === 'form-data'
                        ? 'text-orange-600 border-b-2 border-orange-500'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    form-data
                  </button>
                  <button
                    onClick={() => setBodyType('x-www-form-urlencoded')}
                    className={`px-3 py-1 text-sm font-medium ${
                      bodyType === 'x-www-form-urlencoded'
                        ? 'text-orange-600 border-b-2 border-orange-500'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    x-www-form-urlencoded
                  </button>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as any)}
                    className="p-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option>JSON</option>
                    <option>Text</option>
                    <option>JavaScript</option>
                    <option>HTML</option>
                    <option>XML</option>
                  </select>
                </div>
                <textarea
                  value={requestDetails.body}
                  onChange={(e) => handleBodyChange(e.target.value)}
                  className="w-full h-64 p-2 border rounded font-mono text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="Enter request body"
                />
              </div>
            )}

            {activeTab === 'pre-request' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-2">
                  <select className="p-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <option>JavaScript</option>
                  </select>
                </div>
                <textarea
                  className="w-full h-64 p-2 border rounded font-mono text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="// Write your pre-request script here"
                />
              </div>
            )}

            {activeTab === 'tests' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-2">
                  <select className="p-1 border rounded text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <option>JavaScript</option>
                  </select>
                </div>
                <textarea
                  className="w-full h-64 p-2 border rounded font-mono text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="// Write your test script here"
                />
              </div>
            )}

            {activeTab === 'load-test' && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Concurrent Requests per Second
                      </Typography>
                      <TextField
                        type="number"
                        value={loadTestConfig.numUsers}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          handleLoadTestConfigChange('numUsers', parseInt(e.target.value))}
                        disabled={isLoadTestRunning}
                        fullWidth
                        size="small"
                        inputProps={{
                          min: 1,
                          max: 1000,
                          step: 1
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: 'rgba(255, 255, 255, 0.23)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(255, 255, 255, 0.5)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#f97316', // orange-500
                            },
                            '& input': {
                              color: 'white',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: 'rgba(255, 255, 255, 0.7)',
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#f97316', // orange-500
                          },
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Requests per Minute
                      </Typography>
                      <TextField
                        type="number"
                        value={loadTestConfig.requestsPerMinute}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          handleLoadTestConfigChange('requestsPerMinute', parseInt(e.target.value))}
                        disabled={isLoadTestRunning}
                        fullWidth
                        size="small"
                        inputProps={{
                          min: 1,
                          max: 1000,
                          step: 1
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: 'rgba(255, 255, 255, 0.23)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(255, 255, 255, 0.5)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#f97316', // orange-500
                            },
                            '& input': {
                              color: 'white',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: 'rgba(255, 255, 255, 0.7)',
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#f97316', // orange-500
                          },
                        }}
                      />
                    </Box>
                  </Box>
                  <div className="mt-4 flex justify-end space-x-4">
                    {!isLoadTestRunning ? (
                      <button
                        onClick={runLoadTest}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Load Test
                      </button>
                    ) : (
                      <button
                        onClick={stopLoadTest}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <StopCircle className="h-4 w-4 mr-2" />
                        Stop Load Test
                      </button>
                    )}
                  </div>
                </div>

                {loadTestResults.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                    <Tabs
                      value={resultTab}
                      onChange={handleTabChange}
                      sx={{
                        '& .MuiTab-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                          '&.Mui-selected': {
                            color: '#f97316',
                          },
                        },
                        '& .MuiTabs-indicator': {
                          backgroundColor: '#f97316',
                        },
                      }}
                    >
                      <Tab label="Results Table" />
                      <Tab label="Trend Analysis" />
                      <Tab label="Performance Metrics" />
                    </Tabs>

                    <div className="mt-4">
                      {resultTab === 0 && (
                        <div className="max-h-[calc(100vh-26rem)] overflow-y-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                              <tr>
                                <th colSpan={10} className="px-6 py-3 bg-gray-800 dark:bg-gray-800">
                                  <div className="flex justify-end">
                                    <button
                                      onClick={downloadResultsAsCSV}
                                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                    >
                                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                      </svg>
                                      Download CSV
                                    </button>
                                  </div>
                                </th>
                              </tr>
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">#</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Request</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Start Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">End Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Duration (ms)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Size</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Connection</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Error</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {loadTestResults.map((result, index) => (
                                <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {index + 1}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    User {result.userId}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {requestDetails.method} {requestDetails.url}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {new Date(result.startTime).toLocaleTimeString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {new Date(result.endTime).toLocaleTimeString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{result.duration}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      result.status >= 200 && result.status < 300
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                    }`}>
                                      {result.status || result.statusText || 'Error'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{result.responseSize}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {result.connectionInfo ? (
                                      <span className="flex items-center">
                                        <span className={`w-2 h-2 rounded-full mr-2 ${
                                          result.connectionInfo.keepAlive ? 'bg-green-500' : 'bg-yellow-500'
                                        }`} />
                                        {result.connectionInfo.protocol}//{result.connectionInfo.host}
                                      </span>
                                    ) : '-'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                                    {result.error}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {resultTab === 1 && (
                        <div className="max-h-[calc(100vh-24rem)] overflow-y-auto pr-2">
                          <div className="space-y-6">
                            <div className="bg-gray-700 rounded-lg p-4">
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-medium text-white">Response Time Trend</h4>
                                <button
                                  onClick={() => handleMaximizeChart('line')}
                                  className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
                                  title="Maximize chart"
                                >
                                  <Expand className="w-5 h-5" />
                                </button>
                              </div>
                              <div className="h-[40vh] w-auto">
                                <ChartErrorBoundary>
                                  {trendData && (
                                    <Line
                                      ref={lineChartRef}
                                      data={trendData}
                                      options={lineChartOptions}
                                      fallbackContent={<div>Loading chart...</div>}
                                    />
                                  )}
                                </ChartErrorBoundary>
                              </div>
                            </div>

                            <div className="bg-gray-700 rounded-lg p-4">
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-medium text-white">Request Distribution</h4>
                                <button
                                  onClick={() => handleMaximizeChart('bar')}
                                  className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
                                  title="Maximize chart"
                                >
                                  <Expand className="w-5 h-5" />
                                </button>
                              </div>
                              <div className="h-[30vh] w-auto">
                                <ChartErrorBoundary>
                                  <Bar
                                    ref={barChartRef}
                                    data={prepareDistributionData()!}
                                    options={barChartOptions}
                                    fallbackContent={<div>Loading chart...</div>}
                                  />
                                </ChartErrorBoundary>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {resultTab === 2 && (
                        <div className="max-h-[calc(100vh-24rem)] overflow-y-auto pr-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(loadTestResults.reduce((acc, result) => {
                              if (!acc[result.userId]) {
                                acc[result.userId] = {
                                  total: 0,
                                  success: 0,
                                  failure: 0,
                                  avgResponseTime: 0,
                                  totalResponseTime: 0,
                                  minResponseTime: Infinity,
                                  maxResponseTime: 0,
                                };
                              }
                              acc[result.userId].total++;
                              if (result.status >= 200 && result.status < 300) {
                                acc[result.userId].success++;
                              } else if (result.status >= 400) {
                                acc[result.userId].failure++;
                              }
                              acc[result.userId].totalResponseTime += result.duration;
                              acc[result.userId].avgResponseTime = acc[result.userId].totalResponseTime / acc[result.userId].total;
                              acc[result.userId].minResponseTime = Math.min(acc[result.userId].minResponseTime, result.duration);
                              acc[result.userId].maxResponseTime = Math.max(acc[result.userId].maxResponseTime, result.duration);
                              return acc;
                            }, {} as Record<number, {
                              total: number;
                              success: number;
                              failure: number;
                              avgResponseTime: number;
                              totalResponseTime: number;
                              minResponseTime: number;
                              maxResponseTime: number;
                            }>)).map(([userId, stats]) => (
                              <div key={userId} className="bg-gray-700 rounded-lg p-4">
                                <h4 className="text-lg font-medium text-white mb-4">User {userId}</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-gray-400">Total Requests</p>
                                    <p className="text-white">{stats.total}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-400">Success Rate</p>
                                    <p className="text-white">{((stats.success / stats.total) * 100).toFixed(1)}%</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-400">Failure Rate</p>
                                    <p className="text-white">{((stats.failure / stats.total) * 100).toFixed(1)}%</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-400">Avg Response Time</p>
                                    <p className="text-white">{stats.avgResponseTime.toFixed(2)}ms</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-400">Min Response Time</p>
                                    <p className="text-white">{stats.minResponseTime.toFixed(2)}ms</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-400">Max Response Time</p>
                                    <p className="text-white">{stats.maxResponseTime.toFixed(2)}ms</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Response Panel */}
        {response && isResponsePanelVisible && (
          <div className="w-1/2 border-l border-gray-200 dark:border-gray-700 flex flex-col h-[calc(100vh-4rem)]">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    response.status >= 200 && response.status < 300
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : response.status >= 300 && response.status < 400
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      : response.status >= 400 && response.status < 500
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {response.status} {response.statusText}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {response.time}ms
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {response.size} bytes
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsResponseExpanded(true)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                  title="Expand response"
                >
                  <Expand className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCopyResponse}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                  title="Copy response"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <div className="h-full overflow-auto">
                <SyntaxHighlighter
                  language="json"
                  style={vs2015}
                  customStyle={{
                    margin: 0,
                    height: '100%',
                    fontSize: '0.875rem',
                    lineHeight: '1.5rem',
                  }}
                  showLineNumbers
                  wrapLines={false}
                >
                  {typeof response.data === 'string'
                    ? response.data
                    : JSON.stringify(response.data, null, 2)}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        )}

        {/* Full Screen Response Modal */}
        {isResponseExpanded && response && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-900 w-[90vw] h-[90vh] rounded-lg shadow-xl flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      response.status >= 200 && response.status < 300
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : response.status >= 300 && response.status < 400
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        : response.status >= 400 && response.status < 500
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {response.status} {response.statusText}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {response.time}ms
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {response.size} bytes
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyResponse}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                    title="Copy response"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => setIsResponseExpanded(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <div className="h-full overflow-auto">
                  <SyntaxHighlighter
                    language="json"
                    style={vs2015}
                    customStyle={{
                      margin: 0,
                      height: '100%',
                      fontSize: '0.875rem',
                      lineHeight: '1.5rem',
                    }}
                    showLineNumbers
                    wrapLines={false}
                  >
                    {typeof response.data === 'string'
                      ? response.data
                      : JSON.stringify(response.data, null, 2)}
                  </SyntaxHighlighter>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Screen Chart Modal */}
        {isChartExpanded && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
            <div className="w-[90vw] h-[90vh] bg-gray-800 rounded-lg shadow-xl flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h3 className="text-xl font-medium text-white">
                  {expandedChartType === 'line' ? 'Response Time Trend' : 'Request Distribution'}
                </h3>
                <button
                  onClick={() => {
                    setIsChartExpanded(false);
                    setExpandedChartType(null);
                  }}
                  className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 p-4">
                <div className="h-full w-full">
                  <ChartErrorBoundary>
                    {expandedChartType === 'line' && trendData && (
                      <Line
                        data={trendData}
                        options={{
                          ...lineChartOptions,
                          maintainAspectRatio: false,
                          responsive: true
                        }}
                      />
                    )}
                    {expandedChartType === 'bar' && (
                      <Bar
                        data={prepareDistributionData()!}
                        options={{
                          ...barChartOptions,
                          maintainAspectRatio: false,
                          responsive: true
                        }}
                      />
                    )}
                  </ChartErrorBoundary>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 p-4 bg-red-50 dark:bg-red-900/30 rounded-md shadow-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      {copyMessage && (
        <div className="fixed bottom-4 right-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-md shadow-lg">
          <p className="text-green-600 dark:text-green-400">{copyMessage}</p>
        </div>
      )}
    </div>
  );
};

const styles = `
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default ApiTesting;