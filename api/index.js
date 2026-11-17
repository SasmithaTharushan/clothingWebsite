// Vercel serverless entry: vercel.json rewrites /api/* (plus sitemap.xml and
// robots.txt) to this function, which hands the request to the Express app.
import app from '../server/app.js';

export default app;
