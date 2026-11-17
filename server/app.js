import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDB } from './config/db.js';
import routes from './routes/index.js';
import { sitemap, robots } from './controllers/seoController.js';

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
// Same origin on Vercel; CLIENT_URL only matters if the site is hosted elsewhere.
app.use(cors({ origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : true, credentials: true }));

app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok' }));
app.get('/robots.txt', robots);

// Everything below needs the database.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.get('/sitemap.xml', sitemap);
app.use('/api', routes);
app.use('/api', (req, res) => res.status(404).json({ success: false, message: 'Not found' }));

// Express 5 forwards async errors here automatically.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || (err.code === 'LIMIT_FILE_SIZE' ? 413 : 500);
  const message =
    err.code === 'LIMIT_FILE_SIZE'
      ? 'Image is too large (max 4 MB)'
      : status < 500
        ? err.message
        : 'Something went wrong on our side. Please try again.';
  res.status(status).json({ success: false, message });
});

export default app;
