import express from 'express';
import * as validationService from '../services/validationService.js';

const router = express.Router();

router.post('/validate', async (req, res) => {
  try {
    const results = await validationService.validateTemplate(req.body);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
