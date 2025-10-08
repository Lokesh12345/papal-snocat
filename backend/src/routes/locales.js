import express from 'express';
import * as localeService from '../services/localeService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const locales = await localeService.getAllLocales();
    res.json(locales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/supported', (req, res) => {
  res.json(localeService.getSupportedLocales());
});

router.get('/:lang', async (req, res) => {
  try {
    const locale = await localeService.getLocale(req.params.lang);
    if (!locale) {
      return res.status(404).json({ error: 'Locale not found' });
    }
    res.json(locale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:lang', async (req, res) => {
  try {
    const locale = await localeService.updateLocale(req.params.lang, req.body);
    res.json(locale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/check-completeness', async (req, res) => {
  try {
    const { requiredKeys } = req.body;
    const results = await localeService.checkLocaleCompleteness(requiredKeys);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
