import { K6TestConfig, K6Metrics, K6Result } from '../types/k6Types';

export async function executeK6Test(config: K6TestConfig): Promise<K6Result> {
  try {
    // Create k6 script based on test configuration
    const script = generateK6Script(config);
    
    // Execute k6 test
    const response = await fetch('http://localhost:4000/api/k6/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        script,
        config
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to execute k6 test');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error executing k6 test:', error);
    throw error;
  }
}

function generateK6Script(config: K6TestConfig): string {
  const { testType, url, method, headers, body } = config;
  
  let script = `
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

// Test configuration
export const options = {
  ${generateTestOptions(config)}
};

// Main test function
export default function() {
  const params = {
    headers: ${JSON.stringify(headers)},
  };

  ${body ? `const payload = ${JSON.stringify(body)};` : ''}

  const response = http.${method.toLowerCase()}('${url}'${body ? ', payload' : ''}, params);
  
  // Record metrics
  errorRate.add(response.status !== 200);
  responseTime.add(response.timings.duration);
  
  // Check response
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
`;

  return script;
}

function generateTestOptions(config: K6TestConfig): string {
  switch (config.testType) {
    case 'load':
      return `
  scenarios: {
    constant_load: {
      executor: 'constant-vus',
      vus: ${config.loadVUs},
      duration: '${config.loadDuration}',
    },
  },`;

    case 'stress':
      return `
  scenarios: {
    stress_test: {
      executor: 'ramping-vus',
      startVUs: ${config.stressStartVUs},
      stages: [
        { duration: '${config.stressRampUpDuration}', target: ${config.stressMaxVUs} },
        { duration: '${config.stressHoldDuration}', target: ${config.stressMaxVUs} },
        { duration: '${config.stressRampDownDuration}', target: ${config.stressStartVUs} },
      ],
    },
  },`;

    case 'spike':
      return `
  scenarios: {
    spike_test: {
      executor: 'ramping-vus',
      startVUs: ${config.spikeNormalVUs},
      stages: [
        { duration: '${config.spikeRampUpDuration}', target: ${config.spikePeakVUs} },
        { duration: '${config.spikeHoldDuration}', target: ${config.spikePeakVUs} },
        { duration: '${config.spikeRampDownDuration}', target: ${config.spikeNormalVUs} },
      ],
    },
  },`;

    case 'soak':
      return `
  scenarios: {
    soak_test: {
      executor: 'constant-vus',
      vus: ${config.soakVUs},
      duration: '${config.soakDuration}',
    },
  },`;

    case 'breakpoint':
      return `
  scenarios: {
    breakpoint_test: {
      executor: 'ramping-vus',
      startVUs: ${config.breakpointStartVUs},
      stages: [
        { duration: '${config.breakpointStepDuration}', target: ${config.breakpointMaxVUs} },
      ],
      gracefulRampDown: '30s',
    },
  },`;

    default:
      return `
  scenarios: {
    default: {
      executor: 'constant-vus',
      vus: 10,
      duration: '1m',
    },
  },`;
  }
}

export async function getK6TestStatus(testId: string): Promise<K6Result> {
  try {
    const response = await fetch(`http://localhost:4000/api/k6/status/${testId}`);
    if (!response.ok) {
      throw new Error('Failed to get k6 test status');
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting k6 test status:', error);
    throw error;
  }
}

export async function stopK6Test(testId: string): Promise<void> {
  try {
    const response = await fetch(`http://localhost:4000/api/k6/stop/${testId}`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to stop k6 test');
    }
  } catch (error) {
    console.error('Error stopping k6 test:', error);
    throw error;
  }
} 