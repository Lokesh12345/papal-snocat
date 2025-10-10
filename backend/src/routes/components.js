import express from 'express';
import * as componentService from '../services/componentService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const components = await componentService.getAllComponents();
    res.json(components);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const component = await componentService.getComponent(req.params.id);
    if (!component) {
      return res.status(404).json({ error: 'Component not found' });
    }
    res.json(component);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const component = await componentService.createComponent(req.body);
    res.status(201).json(component);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const component = await componentService.updateComponent(req.params.id, req.body);
    res.json(component);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await componentService.deleteComponent(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
