import express from 'express';
import * as analyticsService from '../services/analyticsService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const analytics = await analyticsService.getAnalytics();
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
