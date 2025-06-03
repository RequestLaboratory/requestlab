import React from 'react';
import { Box, TextField, Typography, Tabs, Tab } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';
import { LoadTestConfig, LoadTestResult } from '../../utils/apiTestingUtils';
import { Play, StopCircle, Expand } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import ChartErrorBoundary from './ChartErrorBoundary';

interface LoadTestTabProps {
  config: LoadTestConfig;
  onConfigChange: (key: keyof LoadTestConfig, value: number) => void;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  results: LoadTestResult[];
  onDownloadResults: () => void;
}

interface UserStats {
  total: number;
  success: number;
  failure: number;
  avgResponseTime: number;
  totalResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
}

const LoadTestTab: React.FC<LoadTestTabProps> = ({
  config,
  onConfigChange,
  isRunning,
  onStart,
  onStop,
  results,
  onDownloadResults
}) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [resultTab, setResultTab] = React.useState(0);

  const muiTheme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
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
              '& input': {
                color: 'inherit',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'inherit',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#f97316',
            },
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            color: 'inherit',
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            '& .MuiTab-root': {
              color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
              '&.Mui-selected': {
                color: '#f97316',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#f97316',
            },
          },
        },
      },
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setResultTab(newValue);
  };

  const prepareTrendData = () => {
    if (!results.length) return null;

    // Group results by user
    const userGroups = results.reduce((acc, result) => {
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

  const prepareDistributionData = () => {
    if (!results.length) return null;

    const statusCounts = results.reduce((acc, result) => {
      const status = result.status || 'Error';
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

  const prepareOverallTrendData = () => {
    if (!results.length) return null;

    // Sort results by start time
    const sortedResults = [...results].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    return {
      datasets: [{
        label: 'Response Time',
        data: sortedResults.map((r, index) => ({
          x: index + 1,
          y: r.duration
        })),
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: 'white',
        pointBorderColor: '#f97316',
        pointHoverBackgroundColor: 'white',
        pointHoverBorderColor: '#f97316',
        tension: 0.4,
        fill: true
      }]
    };
  };

  const [expandedChart, setExpandedChart] = React.useState<string | null>(null);

  const handleExpandChart = (chartId: string) => {
    setExpandedChart(expandedChart === chartId ? null : chartId);
  };

  const handleCloseExpandedChart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedChart(null);
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDarkMode ? '#fff' : '#000',
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toFixed(2)}ms`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'second' as const,
          displayFormats: {
            second: 'HH:mm:ss'
          }
        },
        title: {
          display: true,
          text: 'Time',
          color: isDarkMode ? '#fff' : '#000'
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: isDarkMode ? '#fff' : '#000'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Response Time (ms)',
          color: isDarkMode ? '#fff' : '#000'
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: isDarkMode ? '#fff' : '#000'
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDarkMode ? '#fff' : '#000',
          usePointStyle: true,
          pointStyle: 'circle'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Count',
          color: isDarkMode ? '#fff' : '#000'
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: isDarkMode ? '#fff' : '#000'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Status Code',
          color: isDarkMode ? '#fff' : '#000'
        },
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: isDarkMode ? '#fff' : '#000'
        }
      }
    }
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
            <Box>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: 'text.secondary',
                  mb: 1
                }}
              >
                Concurrent Requests per Second
              </Typography>
              <TextField
                type="number"
                value={config.numUsers}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  onConfigChange('numUsers', parseInt(e.target.value))}
                disabled={isRunning}
                fullWidth
                size="small"
                inputProps={{
                  min: 1,
                  max: 1000,
                  step: 1
                }}
              />
            </Box>
            <Box>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: 'text.secondary',
                  mb: 1
                }}
              >
                Requests per Minute
              </Typography>
              <TextField
                type="number"
                value={config.requestsPerMinute}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  onConfigChange('requestsPerMinute', parseInt(e.target.value))}
                disabled={isRunning}
                fullWidth
                size="small"
                inputProps={{
                  min: 1,
                  max: 1000,
                  step: 1
                }}
              />
            </Box>
          </Box>
          <div className="mt-4 flex justify-end space-x-4">
            {!isRunning ? (
              <button
                onClick={onStart}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Load Test
              </button>
            ) : (
              <button
                onClick={onStop}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <StopCircle className="h-4 w-4 mr-2" />
                Stop Load Test
              </button>
            )}
          </div>
        </div>

        {results.length > 0 && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
            <Tabs
              value={resultTab}
              onChange={handleTabChange}
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
                        <th colSpan={10} className="px-6 py-3 bg-gray-100 dark:bg-gray-800">
                          <div className="flex justify-end">
                            <button
                              onClick={onDownloadResults}
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
                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[5%]">#</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[5%]">User</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[25%]">Request</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[10%]">Start Time</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[10%]">End Time</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[10%]">Duration (ms)</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[10%]">Status</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[10%]">Size</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[10%]">Connection</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[5%]">Error</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {results.map((result, index) => (
                        <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {index + 1}
                          </td>
                          <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            User {result.userId}
                          </td>
                          <td className="px-2 py-4 text-sm text-gray-900 dark:text-white">
                            <div className="truncate max-w-[300px]" title={`${result.method} ${result.url}`}>
                              {result.method} {result.url}
                            </div>
                          </td>
                          <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {new Date(result.startTime).toLocaleTimeString()}
                          </td>
                          <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {new Date(result.endTime).toLocaleTimeString()}
                          </td>
                          <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{result.duration}</td>
                          <td className="px-2 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              (result.status ?? 0) >= 200 && (result.status ?? 0) < 300
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {result.status || result.statusText || 'Error'}
                            </span>
                          </td>
                          <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{result.responseSize}</td>
                          <td className="px-2 py-4 text-sm text-gray-900 dark:text-white">
                            {result.connectionInfo ? (
                              <div className="truncate max-w-[150px]" title={`${result.connectionInfo.protocol}//${result.connectionInfo.host}`}>
                                <span className="flex items-center">
                                  <span className={`w-2 h-2 rounded-full mr-2 ${
                                    result.connectionInfo.keepAlive ? 'bg-green-500' : 'bg-yellow-500'
                                  }`} />
                                  {result.connectionInfo.protocol}//{result.connectionInfo.host}
                                </span>
                              </div>
                            ) : '-'}
                          </td>
                          <td className="px-2 py-4 text-sm text-red-600 dark:text-red-400">
                            <div className="truncate max-w-[100px]" title={result.error || ''}>
                              {result.error}
                            </div>
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
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Overall Response Time Trend</h4>
                        <button
                          className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
                          title="Maximize chart"
                          onClick={() => handleExpandChart('overall')}
                        >
                          <Expand className="w-5 h-5" />
                        </button>
                      </div>
                      <div className={`${expandedChart === 'overall' ? 'fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center' : 'h-[40vh] w-auto'}`}>
                        <div className={`${expandedChart === 'overall' ? 'w-[80vw] h-[80vh] bg-gray-700 p-4 rounded-lg relative' : 'w-full h-full'}`}>
                          {expandedChart === 'overall' && (
                            <button
                              className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white transition-colors duration-200 bg-gray-800 rounded-full hover:bg-gray-600"
                              onClick={handleCloseExpandedChart}
                              title="Close"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                          <ChartErrorBoundary>
                            {prepareOverallTrendData() && (
                              <Line
                                data={prepareOverallTrendData()!}
                                options={{
                                  ...lineChartOptions,
                                  scales: {
                                    ...lineChartOptions.scales,
                                    x: {
                                      ...lineChartOptions.scales.x,
                                      type: 'linear' as const,
                                      title: {
                                        display: true,
                                        text: 'Request Number',
                                        color: isDarkMode ? '#fff' : '#000'
                                      }
                                    }
                                  }
                                }}
                                fallbackContent={<div>Loading chart...</div>}
                              />
                            )}
                          </ChartErrorBoundary>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Response Time Trend by User</h4>
                        <button
                          className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
                          title="Maximize chart"
                          onClick={() => handleExpandChart('user')}
                        >
                          <Expand className="w-5 h-5" />
                        </button>
                      </div>
                      <div className={`${expandedChart === 'user' ? 'fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center' : 'h-[40vh] w-auto'}`}>
                        <div className={`${expandedChart === 'user' ? 'w-[80vw] h-[80vh] bg-gray-700 p-4 rounded-lg relative' : 'w-full h-full'}`}>
                          {expandedChart === 'user' && (
                            <button
                              className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white transition-colors duration-200 bg-gray-800 rounded-full hover:bg-gray-600"
                              onClick={handleCloseExpandedChart}
                              title="Close"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                          <ChartErrorBoundary>
                            {prepareTrendData() && (
                              <Line
                                data={prepareTrendData()!}
                                options={lineChartOptions}
                                fallbackContent={<div>Loading chart...</div>}
                              />
                            )}
                          </ChartErrorBoundary>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Request Distribution</h4>
                        <button
                          className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
                          title="Maximize chart"
                          onClick={() => handleExpandChart('distribution')}
                        >
                          <Expand className="w-5 h-5" />
                        </button>
                      </div>
                      <div className={`${expandedChart === 'distribution' ? 'fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center' : 'h-[30vh] w-auto'}`}>
                        <div className={`${expandedChart === 'distribution' ? 'w-[80vw] h-[80vh] bg-gray-700 p-4 rounded-lg relative' : 'w-full h-full'}`}>
                          {expandedChart === 'distribution' && (
                            <button
                              className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white transition-colors duration-200 bg-gray-800 rounded-full hover:bg-gray-600"
                              onClick={handleCloseExpandedChart}
                              title="Close"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                          <ChartErrorBoundary>
                            {prepareDistributionData() && (
                              <Bar
                                data={prepareDistributionData()!}
                                options={barChartOptions}
                                fallbackContent={<div>Loading chart...</div>}
                              />
                            )}
                          </ChartErrorBoundary>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {resultTab === 2 && (
                <div className="max-h-[calc(100vh-24rem)] overflow-y-auto pr-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(results.reduce((acc, result) => {
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
                      const status = result.status ?? 0;
                      if (status >= 200 && status < 300) {
                        acc[result.userId].success++;
                      } else if (status >= 400) {
                        acc[result.userId].failure++;
                      }
                      acc[result.userId].totalResponseTime += result.duration;
                      acc[result.userId].avgResponseTime = acc[result.userId].totalResponseTime / acc[result.userId].total;
                      acc[result.userId].minResponseTime = Math.min(acc[result.userId].minResponseTime, result.duration);
                      acc[result.userId].maxResponseTime = Math.max(acc[result.userId].maxResponseTime, result.duration);
                      return acc;
                    }, {} as Record<number, UserStats>)).map(([userId, stats]) => (
                      <div key={userId} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">User {userId}</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Total Requests</p>
                            <p className="text-gray-900 dark:text-white">{stats.total}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Success Rate</p>
                            <p className="text-gray-900 dark:text-white">{((stats.success / stats.total) * 100).toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Failure Rate</p>
                            <p className="text-gray-900 dark:text-white">{((stats.failure / stats.total) * 100).toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Avg Response Time</p>
                            <p className="text-gray-900 dark:text-white">{stats.avgResponseTime.toFixed(2)}ms</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Min Response Time</p>
                            <p className="text-gray-900 dark:text-white">{stats.minResponseTime.toFixed(2)}ms</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Max Response Time</p>
                            <p className="text-gray-900 dark:text-white">{stats.maxResponseTime.toFixed(2)}ms</p>
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
    </ThemeProvider>
  );
};

export default LoadTestTab; 