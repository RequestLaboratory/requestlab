import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

// Store active tests
const activeTests = new Map<string, { process: any; startTime: number }>();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { script, config } = req.body;
    const testId = uuidv4();
    
    // Create temporary script file
    const scriptPath = path.join(process.cwd(), 'tmp', `${testId}.js`);
    await writeFile(scriptPath, script);

    // Execute k6 test
    const k6Process = execAsync(`k6 run ${scriptPath} --out json=tmp/${testId}.json`);
    
    // Store test process
    activeTests.set(testId, {
      process: k6Process,
      startTime: Date.now()
    });

    // Return test ID for status tracking
    res.status(200).json({
      testId,
      status: 'running',
      message: 'Test started successfully'
    });

    // Clean up after test completion
    k6Process.then(() => {
      activeTests.delete(testId);
    }).catch(() => {
      activeTests.delete(testId);
    });

  } catch (error) {
    console.error('Error executing k6 test:', error);
    res.status(500).json({ error: 'Failed to execute k6 test' });
  }
} 