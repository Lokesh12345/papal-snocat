import express from 'express';
import * as smsService from '../services/smsService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { brand } = req.query;
    const sms = await smsService.getAllSMS(brand);
    res.json(sms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const sms = await smsService.getSMSById(req.params.id);
    if (!sms) {
      return res.status(404).json({ error: 'SMS not found' });
    }
    res.json(sms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const newSMS = await smsService.createSMS(req.body);
    res.status(201).json(newSMS);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedSMS = await smsService.updateSMS(req.params.id, req.body);
    res.json(updatedSMS);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await smsService.deleteSMS(req.params.id);
    res.json({ message: 'SMS deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
