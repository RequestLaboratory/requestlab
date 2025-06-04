import React, { useState, useEffect, useRef, useContext } from 'react';
import { executeApiRequest } from '../utils/apiTestingUtils';
import { parseCurlCommand } from '../utils/curlParser';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Copy, Check, Expand, X, Terminal, Play, StopCircle, BarChart2 } from 'lucide-react';
import { TextField, Box, Typography, Tabs, Tab, ThemeProvider, createTheme, Drawer, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Checkbox } from '@mui/material';
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
import { ThemeContext } from '../contexts/ThemeContext';
import LoadTestTab from '../components/api-testing/LoadTestTab';

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
  enabledHeaders: Record<string, boolean>;
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
  curlCommand?: string;
}

interface LoadTestConfig {
  numUsers: number;
  requestsPerMinute: number;
}

interface LoadTestResult {
  id: number;
  userId: number;
  method: string;
  url: string;
  startTime: number;
  endTime: number;
  duration: number;
  status?: number;
  statusText?: string;
  responseSize: number;
  error?: string;
  connectionInfo?: {
    protocol: string;
    host: string;
    keepAlive: boolean;
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

// Utility to sync enabledHeaders with headers
const syncEnabledHeaders = (headers: Record<string, string>, prevEnabled: Record<string, boolean> = {}) => {
  const newEnabled: Record<string, boolean> = {};
  Object.keys(headers).forEach(key => {
    newEnabled[key] = prevEnabled[key] !== undefined ? prevEnabled[key] : true;
  });
  return newEnabled;
};

const ApiTesting: React.FC = () => {
  const { isDarkMode } = useContext(ThemeContext);
  
  // Create MUI theme based on dark/light mode
  const muiTheme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#f97316', // orange-500
      },
    },
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
              },
              '&:hover fieldset': {
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#f97316',
              },
            },
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
          },
        },
      },
    },
  });

  const [requestDetails, setRequestDetails] = useState<RequestDetails>(() => {
    const savedState = sessionStorage.getItem('apiTestingState');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      const headers = parsed.headers || { 'header-1': '' };
      return {
        method: parsed.method || 'GET',
        url: parsed.url || '',
        headers,
        enabledHeaders: syncEnabledHeaders(headers, parsed.enabledHeaders),
        body: parsed.body || '',
        queryParams: parsed.queryParams || {}
      };
    }
    // Default GitHub API example
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'RequestLab'
    };
    return {
      method: 'GET',
      url: 'https://api.github.com/repos/vuejs/vue',
      headers,
      enabledHeaders: syncEnabledHeaders(headers),
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
    return (savedTab as 'params' | 'headers' | 'body' | 'pre-request' | 'tests' | 'load-test') || 'headers';
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
  const [responseTab, setResponseTab] = useState<'response' | 'network'>('response');
  
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

  const [isCurlDrawerOpen, setIsCurlDrawerOpen] = useState(false);
  const [curlCopied, setCurlCopied] = useState(false);

  const [isImportCurlOpen, setIsImportCurlOpen] = useState(false);
  const [curlInput, setCurlInput] = useState('');

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
      // Filter headers based on enabledHeaders
      const activeHeaders = Object.entries(requestDetails.headers).reduce((acc, [key, value]) => {
        if (requestDetails.enabledHeaders[key]) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>);

      // Build the actual cURL command that will be sent
      const actualCurlCommand = (() => {
        let curl = `curl '${requestDetails.url}' \\\n`;
        if (requestDetails.method !== 'GET') {
          curl += `  -X ${requestDetails.method} \\\n`;
        }
        Object.entries(activeHeaders).forEach(([key, value]) => {
          if (key && value) {
            curl += `  -H '${key}: ${value}' \\\n`;
          }
        });
        if (requestDetails.body) {
          curl += `  -d '${requestDetails.body}' \\\n`;
        }
        return curl.slice(0, -3); // Remove trailing backslash and newline
      })();

      const result = await executeApiRequest({
        url: requestDetails.url,
        method: requestDetails.method,
        headers: {
          ...activeHeaders,
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
          : JSON.stringify(responseData.response).length,
        curlCommand: actualCurlCommand
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

  const handleHeaderToggle = (key: string) => {
    setRequestDetails(prev => ({
      ...prev,
      enabledHeaders: {
        ...prev.enabledHeaders,
        [key]: !prev.enabledHeaders[key]
      }
    }));
  };

  const handleHeaderChange = (key: string, value: string) => {
    setRequestDetails(prev => ({
      ...prev,
      headers: { ...prev.headers, [key]: value },
      enabledHeaders: {
        ...prev.enabledHeaders,
        [key]: true
      }
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

  const buildCurlCommand = () => {
    let curlCommand = `curl '${requestDetails.url}' \\\n`;
    if (requestDetails.method !== 'GET') {
      curlCommand += `  -X ${requestDetails.method} \\\n`;
    }
    Object.entries(requestDetails.headers).forEach(([key, value]) => {
      if (key && value) {
        curlCommand += `  -H '${key}: ${value}' \\\n`;
      }
    });
    if (requestDetails.body) {
      curlCommand += `  -d '${requestDetails.body}' \\\n`;
    }
    curlCommand = curlCommand.slice(0, -3);
    return curlCommand;
  };

  const handleCopyCurlInDrawer = () => {
    navigator.clipboard.writeText(buildCurlCommand());
    setCurlCopied(true);
    setTimeout(() => setCurlCopied(false), 2000);
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
          method: requestDetails.method,
          url: requestDetails.url,
          startTime: 0,
          endTime: 0,
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
          'Expires': '0',
          'X-Request-ID': `${Date.now()}_${vuId}_${iteration}` // Add unique request ID
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
            method: requestDetails.method,
            url: requestDetails.url,
            startTime: 0,
            endTime: 0,
            duration: 0,
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
            method: requestDetails.method,
            url: requestDetails.url,
            startTime: 0,
            endTime: 0,
            duration: 0,
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
          method: requestDetails.method,
          url: requestDetails.url,
          startTime: startTime.getTime(),
          endTime: endTime.getTime(),
          duration: endTime.getTime() - startTime.getTime(),
          status: responseData.status,
          statusText: responseData.headers['status-text'] || '',
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
            method: requestDetails.method,
            url: requestDetails.url,
            startTime: 0,
            endTime: 0,
            duration: 0,
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
          method: requestDetails.method,
          url: requestDetails.url,
          startTime: 0,
          endTime: 0,
          duration: 0,
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
            method: requestDetails.method,
            url: requestDetails.url,
            startTime: 0,
            endTime: 0,
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

    const successResults = loadTestResults.filter(r => {
      const status = r.status ?? 0;
      return status >= 200 && status < 300;
    });
    const failureResults = loadTestResults.filter(r => {
      const status = r.status ?? 0;
      return status >= 400;
    });
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

    const statusCounts = loadTestResults.reduce((acc, result) => {
      const status = result.status ?? 0;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(statusCounts),
      datasets: [
        {
          label: 'Number of Requests',
          data: Object.values(statusCounts),
          backgroundColor: Object.keys(statusCounts).map(status => {
            const code = parseInt(status);
            return code >= 200 && code < 300 ? '#22c55e' : '#ef4444';
          }),
        },
      ],
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
      result.method,
      result.url,
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

  const handleImportCurl = () => {
    if (curlInput) {
      try {
        // Clean up the cURL command
        const cleanCurl = curlInput.trim()
          .replace(/\\\n/g, ' ') // Replace line continuations with spaces
          .replace(/\s+/g, ' '); // Replace multiple spaces with single space

        const parsedCurl = parseCurlCommand(cleanCurl);

        // Format JSON body if Content-Type is application/json
        let formattedBody = parsedCurl.body;
        const contentTypeHeader = Object.entries(parsedCurl.headers).find(([key]) =>
          key.toLowerCase() === 'content-type'
        );
        if (
          contentTypeHeader &&
          contentTypeHeader[1].toLowerCase().includes('application/json') &&
          parsedCurl.body
        ) {
          try {
            formattedBody = JSON.stringify(JSON.parse(parsedCurl.body), null, 2);
          } catch (e) {
            // If not valid JSON, leave as is
          }
        }

        setRequestDetails(prev => {
          const newHeaders = parsedCurl.headers || {};
          return {
            ...prev,
            method: parsedCurl.method || 'GET',
            url: parsedCurl.url || '',
            headers: newHeaders,
            enabledHeaders: syncEnabledHeaders(newHeaders),
            body: formattedBody || '',
            queryParams: parsedCurl.queryParams || {}
          };
        });

        // Set body type if present
        if (parsedCurl.body) {
          setBodyType('raw');
          if (contentTypeHeader) {
            setContentType(contentTypeHeader[1]);
          }
        }

        setIsImportCurlOpen(false);
        setCurlInput('');
      } catch (err) {
        alert('Invalid cURL command. Please check the format and try again.');
        console.error('Failed to parse cURL command:', err);
      }
    }
  };

  return (
    <ThemeProvider theme={muiTheme}>
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
            onClick={() => setIsImportCurlOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-200"
            title="Import cURL"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="text-sm font-medium">Import cURL</span>
          </button>
          <button
            onClick={() => setIsCurlDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-200"
            title="Show cURL"
        >
          <Terminal className="w-4 h-4" />
            <span className="text-sm font-medium">Show cURL</span>
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
        <div className="flex-1 flex flex-col">
        {/* Main Request Area */}
          <div className="flex-1 flex flex-col">
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
                <div className="space-y-4 h-[calc(100vh-30rem)] overflow-y-auto">
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
                  <div className="mt-4">
                <button
                  onClick={() => handleQueryParamChange('', '')}
                  className="text-orange-500 hover:text-orange-600 dark:text-orange-400"
                >
                  + Add Parameter
                </button>
                  </div>
              </div>
            )}

            {activeTab === 'headers' && (
                <div className="flex flex-col h-[calc(100vh-30rem)]">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                    <div className="col-span-1">ENABLED</div>
                    <div className="col-span-3">KEY</div>
                  <div className="col-span-4">VALUE</div>
                  <div className="col-span-4">DESCRIPTION</div>
                </div>
                <div className="flex-1 overflow-y-auto overflow-x-hidden pr-4 min-h-0">
                  <div className="space-y-4">
                    {Object.entries(requestDetails.headers).map(([key, value], index) => (
                      <div key={index} className="grid grid-cols-12 gap-4">
                          <div className="col-span-1 flex items-center">
                            <Checkbox
                              checked={!!requestDetails.enabledHeaders[key]}
                              onChange={() => handleHeaderToggle(key)}
                              color="warning"
                              sx={{
                                color: '#f97316',
                                '&.Mui-checked': {
                                  color: '#f97316',
                                },
                                '& .MuiSvgIcon-root': {
                                  fontSize: 24,
                                },
                              }}
                            />
                          </div>
                        <input
                          type="text"
                          value={key}
                          onChange={(e) => {
                            const newKey = e.target.value;
                            const newHeaders = { ...requestDetails.headers };
                              const newEnabledHeaders = { ...requestDetails.enabledHeaders };
                            delete newHeaders[key];
                              delete newEnabledHeaders[key];
                            newHeaders[newKey] = value;
                              newEnabledHeaders[newKey] = true;
                            setRequestDetails(prev => ({
                              ...prev,
                                headers: newHeaders,
                                enabledHeaders: newEnabledHeaders
                            }));
                          }}
                            className="col-span-3 p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white truncate"
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
                                const newEnabledHeaders = { ...requestDetails.enabledHeaders };
                              delete newHeaders[key];
                                delete newEnabledHeaders[key];
                              setRequestDetails(prev => ({
                                ...prev,
                                  headers: newHeaders,
                                  enabledHeaders: newEnabledHeaders
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
                          headers: { ...prev.headers, [newKey]: '' },
                          enabledHeaders: { ...prev.enabledHeaders, [newKey]: true }
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
                <div className="space-y-4 h-[calc(100vh-30rem)] overflow-y-auto">
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
                <div className="space-y-4 h-[calc(100vh-30rem)] overflow-y-auto">
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
                <div className="space-y-4 h-[calc(100vh-30rem)] overflow-y-auto">
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
                <LoadTestTab
                  config={loadTestConfig}
                  onConfigChange={handleLoadTestConfigChange}
                  isRunning={isLoadTestRunning}
                  onStart={runLoadTest}
                  onStop={stopLoadTest}
                  results={loadTestResults}
                  onDownloadResults={downloadResultsAsCSV}
                />
            )}
          </div>
        </div>

          {/* Response Panel - Only show when not in load test tab */}
          {response && activeTab !== 'load-test' && (
            <div className={`border-t border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out transform ${isResponsePanelVisible ? 'h-[400px] opacity-100' : 'h-0 opacity-0'}`}>
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
              <div className="flex-1 min-h-0 overflow-auto">
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setResponseTab('response')}
                    className={`px-4 py-2 text-sm font-medium ${
                      responseTab === 'response'
                        ? 'text-orange-600 border-b-2 border-orange-500'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Response
                  </button>
                  <button
                    onClick={() => setResponseTab('network')}
                    className={`px-4 py-2 text-sm font-medium ${
                      responseTab === 'network'
                        ? 'text-orange-600 border-b-2 border-orange-500'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Network
                  </button>
                </div>
                {responseTab === 'response' ? (
                <SyntaxHighlighter
                  language="json"
                  style={vs2015}
                  customStyle={{
                    margin: 0,
                    height: '26vh',
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
                ) : (
                  <div className="p-4 h-[24vh] overflow-y-auto">
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Request</h3>
                      <SyntaxHighlighter
                        language="bash"
                        style={vs2015}
                        customStyle={{
                          margin: 0,
                          fontSize: '0.875rem',
                          lineHeight: '1.5rem',
                          borderRadius: '0.375rem',
                        }}
                        showLineNumbers
                        wrapLines={true}
                      >
                        {response.curlCommand || ''}
                </SyntaxHighlighter>
              </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Response Headers</h3>
                      <SyntaxHighlighter
                        language="json"
                        style={vs2015}
                        customStyle={{
                          margin: 0,
                          fontSize: '0.875rem',
                          lineHeight: '1.5rem',
                          borderRadius: '0.375rem',
                        }}
                        showLineNumbers
                        wrapLines={false}
                      >
                        {JSON.stringify(response.headers, null, 2)}
                      </SyntaxHighlighter>
            </div>
          </div>
        )}
              </div>
            </div>
          )}
        </div>

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

        {/* cURL Drawer */}
        <Drawer
          anchor="right"
          open={isCurlDrawerOpen}
          onClose={() => setIsCurlDrawerOpen(false)}
          PaperProps={{
            sx: {
              width: { xs: '100vw', sm: 480 },
              backgroundColor: isDarkMode ? '#18181b' : '#fff',
              color: isDarkMode ? '#fff' : '#18181b',
              p: 0,
            },
          }}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-lg font-semibold">cURL Command</span>
              <IconButton onClick={() => setIsCurlDrawerOpen(false)}>
                <X className="w-6 h-6" />
              </IconButton>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <SyntaxHighlighter
                language="bash"
                style={vs2015}
                customStyle={{
                  background: 'none',
                  fontSize: '0.95rem',
                  borderRadius: 8,
                  padding: 0,
                  margin: 0,
                  wordBreak: 'break-all',
                }}
                wrapLines={true}
              >
                {buildCurlCommand()}
              </SyntaxHighlighter>
            </div>
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleCopyCurlInDrawer}
                className="flex items-center gap-1 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors duration-200"
              >
                {curlCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="ml-1">Copy</span>
              </button>
            </div>
          </div>
        </Drawer>

        {/* Import cURL Dialog */}
        <Dialog 
          open={isImportCurlOpen} 
          onClose={() => {
            setIsImportCurlOpen(false);
            setCurlInput('');
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Import cURL Command</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Paste your cURL command here"
              type="text"
              fullWidth
              multiline
              rows={6}
              value={curlInput}
              onChange={(e) => setCurlInput(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setIsImportCurlOpen(false);
                setCurlInput('');
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleImportCurl}
              variant="contained"
              color="primary"
            >
              Import
            </Button>
          </DialogActions>
        </Dialog>
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
    </ThemeProvider>
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