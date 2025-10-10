import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import templatesRouter from './routes/templates.js';
import localesRouter from './routes/locales.js';
import validationRouter from './routes/validation.js';
import requestsRouter from './routes/requests.js';
import analyticsRouter from './routes/analytics.js';
import componentsRouter from './routes/components.js';
import smsRouter from './routes/sms.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/templates', templatesRouter);
app.use('/api/locales', localesRouter);
app.use('/api/validation', validationRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/components', componentsRouter);
app.use('/api/sms', smsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'SNOCAT API' });
});

app.listen(PORT, () => {
  console.log(`🚀 SNOCAT API running on http://localhost:${PORT}`);
});
