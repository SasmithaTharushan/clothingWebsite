// Local development server: `npm run server` (reads .env via --env-file)
import app from './app.js';

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
