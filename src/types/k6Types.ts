export interface K6TestConfig {
  testType: 'load' | 'stress' | 'spike' | 'soak' | 'breakpoint';
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  
  // Load Testing
  loadVUs?: number;
  loadDuration?: string;
  
  // Stress Testing
  stressStartVUs?: number;
  stressMaxVUs?: number;
  stressRampUpDuration?: string;
  stressHoldDuration?: string;
  stressRampDownDuration?: string;
  
  // Spike Testing
  spikeNormalVUs?: number;
  spikePeakVUs?: number;
  spikeRampUpDuration?: string;
  spikeHoldDuration?: string;
  spikeRampDownDuration?: string;
  
  // Soak Testing
  soakVUs?: number;
  soakDuration?: string;
  
  // Breakpoint Testing
  breakpointStartVUs?: number;
  breakpointMaxVUs?: number;
  breakpointStepDuration?: string;
  breakpointStepSize?: number;
}

export interface K6Metrics {
  http_req_duration: { avg: number; min: number; max: number; p95: number };
  http_req_rate: number;
  http_req_failed: number;
  vus: number;
  vus_max: number;
  iterations: number;
  data_received: number;
  data_sent: number;
}

export interface K6Result {
  testId: string;
  timestamp: string;
  metrics: K6Metrics;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  error?: string;
} 