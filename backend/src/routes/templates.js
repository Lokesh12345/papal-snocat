import express from 'express';
import * as templateService from '../services/templateService.js';
import { sendTestEmail } from '../services/emailService.js';

const router = express.Router();

router.get('/:brand', async (req, res) => {
  try {
    const templates = await templateService.getAllTemplates(req.params.brand);
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:brand/:id', async (req, res) => {
  try {
    const template = await templateService.getTemplate(req.params.brand, req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:brand', async (req, res) => {
  try {
    const template = await templateService.createTemplate(req.params.brand, req.body);
    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:brand/:id', async (req, res) => {
  try {
    const template = await templateService.updateTemplate(req.params.brand, req.params.id, req.body);
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:brand/:id', async (req, res) => {
  try {
    await templateService.deleteTemplate(req.params.brand, req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:brand/:id/send-test', async (req, res) => {
  try {
    const template = await templateService.getTemplate(req.params.brand, req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const { recipient } = req.body;
    if (!recipient) {
      return res.status(400).json({ error: 'Recipient email is required' });
    }

    const result = await sendTestEmail(template, recipient);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
