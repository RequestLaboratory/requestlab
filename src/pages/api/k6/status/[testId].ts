import { NextApiRequest, NextApiResponse } from 'next';
import { readFile } from 'fs/promises';
import path from 'path';
import { activeTests } from '../execute';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { testId } = req.query;
    const test = activeTests.get(testId as string);

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Read k6 output file
    const outputPath = path.join(process.cwd(), 'tmp', `${testId}.json`);
    const output = await readFile(outputPath, 'utf-8');
    const metrics = JSON.parse(output);

    // Calculate progress based on test type and duration
    const elapsedTime = Date.now() - test.startTime;
    const progress = Math.min((elapsedTime / (parseInt(metrics.state.testRunDuration) * 1000)) * 100, 100);

    res.status(200).json({
      testId,
      timestamp: new Date().toISOString(),
      metrics: {
        http_req_duration: {
          avg: metrics.metrics.http_req_duration.avg,
          min: metrics.metrics.http_req_duration.min,
          max: metrics.metrics.http_req_duration.max,
          p95: metrics.metrics.http_req_duration.p95
        },
        http_req_rate: metrics.metrics.http_reqs.rate,
        http_req_failed: metrics.metrics.http_req_failed.rate,
        vus: metrics.metrics.vus.value,
        vus_max: metrics.metrics.vus.max,
        iterations: metrics.metrics.iterations.count,
        data_received: metrics.metrics.data_received.count,
        data_sent: metrics.metrics.data_sent.count
      },
      status: test.process ? 'running' : 'completed',
      progress
    });

  } catch (error) {
    console.error('Error getting k6 test status:', error);
    res.status(500).json({ error: 'Failed to get k6 test status' });
  }
} 