const express = require('express');
const { exec } = require('child_process');
const { promisify } = require('util');
const { writeFile, readFile } = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json({ limit: '2mb' }));
app.use(cors());

const activeTests = new Map();

// Start a k6 test
app.post('/api/k6/execute', async (req, res) => {
  try {
    const { script } = req.body;
    const testId = uuidv4();
    const tmpDir = path.join(process.cwd(), 'tmp');
    const scriptPath = path.join(tmpDir, `${testId}.js`);
    const outputPath = path.join(tmpDir, `${testId}.json`);
    await writeFile(scriptPath, script);

    // Start k6 process
    const k6Process = exec(`k6 run ${scriptPath} --out json=${outputPath}`);
    activeTests.set(testId, { process: k6Process, startTime: Date.now(), outputPath });

    res.json({ testId, status: 'running', message: 'Test started successfully' });

    k6Process.on('exit', () => {
      activeTests.delete(testId);
    });
  } catch (err) {
    console.error('Error executing k6 test:', err);
    res.status(500).json({ error: 'Failed to execute k6 test' });
  }
});

// Get k6 test status
app.get('/api/k6/status/:testId', async (req, res) => {
  try {
    const { testId } = req.params;
    const test = activeTests.get(testId);
    const outputPath = path.join(process.cwd(), 'tmp', `${testId}.json`);
    let metrics = {};
    let status = 'completed';
    let progress = 100;
    if (test) {
      status = 'running';
      progress = 50; // You can improve this with more logic
    }
    try {
      const output = await readFile(outputPath, 'utf-8');
      metrics = JSON.parse(output);
    } catch (e) {
      // File may not exist yet
    }
    res.json({ testId, status, metrics, progress });
  } catch (err) {
    console.error('Error getting k6 test status:', err);
    res.status(500).json({ error: 'Failed to get k6 test status' });
  }
});

// Stop a k6 test
app.post('/api/k6/stop/:testId', (req, res) => {
  try {
    const { testId } = req.params;
    const test = activeTests.get(testId);
    if (test && test.process) {
      test.process.kill();
      activeTests.delete(testId);
      res.json({ testId, status: 'stopped', message: 'Test stopped successfully' });
    } else {
      res.status(404).json({ error: 'Test not found' });
    }
  } catch (err) {
    console.error('Error stopping k6 test:', err);
    res.status(500).json({ error: 'Failed to stop k6 test' });
  }
});

app.listen(PORT, () => {
  console.log(`k6 server running on http://localhost:${PORT}`);
}); 