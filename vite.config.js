import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function neonDevApiPlugin() {
  return {
    name: 'neon-dev-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api')) {
          return next();
        }

        const url = new URL(req.url, `http://${req.headers.host}`);
        const pathname = url.pathname;

        // POST request body parsing
        let body = {};
        if (req.method === 'POST') {
          const buffers = [];
          for await (const chunk of req) {
            buffers.push(chunk);
          }
          const raw = Buffer.concat(buffers).toString();
          if (raw) {
            try {
              body = JSON.parse(raw);
            } catch (e) {}
          }
        }
        req.body = body;

        // res.status ve res.json yardımcıları
        res.status = (statusCode) => {
          res.statusCode = statusCode;
          return res;
        };
        res.json = (data) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
          return res;
        };

        try {
          if (pathname === '/api/health') {
            const { default: handler } = await import('./api/health.js');
            return await handler(req, res);
          }
          if (pathname === '/api/init-db') {
            const { default: handler } = await import('./api/init-db.js');
            return await handler(req, res);
          }
          if (pathname === '/api/data') {
            const { default: handler } = await import('./api/data.js');
            return await handler(req, res);
          }
        } catch (err) {
          console.error('Dev API Error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: err.message }));
          return;
        }

        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Yerel ortamda .env değişkenlerini process.env içine aktar
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [react(), neonDevApiPlugin()],
    server: {
      port: 5173,
      open: false
    }
  };
});
