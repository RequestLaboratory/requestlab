import { NextApiRequest, NextApiResponse } from 'next';
import { activeTests } from '../execute';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { testId } = req.query;
    const test = activeTests.get(testId as string);

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Kill the k6 process
    if (test.process) {
      test.process.kill();
      activeTests.delete(testId as string);
    }

    res.status(200).json({
      testId,
      status: 'stopped',
      message: 'Test stopped successfully'
    });

  } catch (error) {
    console.error('Error stopping k6 test:', error);
    res.status(500).json({ error: 'Failed to stop k6 test' });
  }
} 