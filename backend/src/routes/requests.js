import express from 'express';
import { readJSON, writeJSON } from '../utils/fileManager.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const queue = await readJSON('requests/queue.json') || { requests: [] };
    res.json(queue.requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const queue = await readJSON('requests/queue.json') || { requests: [] };
    const newRequest = {
      ...req.body,
      id: `REQ-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    queue.requests.push(newRequest);
    await writeJSON('requests/queue.json', queue);
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const queue = await readJSON('requests/queue.json') || { requests: [] };
    const index = queue.requests.findIndex(r => r.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Request not found' });
    }

    queue.requests[index] = {
      ...queue.requests[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    if (req.body.status === 'deployed') {
      queue.requests[index].deployedAt = new Date().toISOString();
    }

    await writeJSON('requests/queue.json', queue);
    res.json(queue.requests[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const queue = await readJSON('requests/queue.json') || { requests: [] };
    queue.requests = queue.requests.filter(r => r.id !== req.params.id);
    await writeJSON('requests/queue.json', queue);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
