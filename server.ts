import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
// @ts-ignore
import healthHandler from './api/health.js';
// @ts-ignore
import incidentsHandler from './api/incidents.js';
// @ts-ignore
import trafficImagesHandler from './api/traffic-images.js';
// @ts-ignore
import mapsConfigHandler from './api/maps-config.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isDev = process.env.NODE_ENV !== 'production';

  app.use(express.json());

  // Mount Vercel-compatible API handlers
  app.all('/api/health', (req, res) => healthHandler(req, res));
  app.all('/api/incidents', (req, res) => incidentsHandler(req, res));
  app.all('/api/traffic-images', (req, res) => trafficImagesHandler(req, res));
  app.all('/api/maps-config', (req, res) => mapsConfigHandler(req, res));

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SG Flow server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
