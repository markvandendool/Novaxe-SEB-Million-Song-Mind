import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import fs from 'fs';
// import { componentTagger } from 'lovable-tagger';

// Dev-only logging middleware: POST /__log → append JSONL to .logs/app.log
function loggingMiddleware() {
  return {
    name: 'dev-log-middleware',
    configureServer(server: any) {
      server.middlewares.use('/__log', (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }
        const chunks: Buffer[] = [];
        req.on('data', (chunk: Buffer) => chunks.push(chunk));
        req.on('end', () => {
          try {
            const body = Buffer.concat(chunks).toString('utf-8') || '{}';
            const logDir = path.resolve(process.cwd(), '.logs');
            const logFile = path.join(logDir, 'app.log');
            if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
            const line = body.trim() + '\n';
            fs.appendFileSync(logFile, line, 'utf8');
            res.statusCode = 204;
            res.end();
          } catch {
            res.statusCode = 500;
            res.end('Log write error');
          }
        });
      });

      // Optional: clear logs
      server.middlewares.use('/__log/clear', (req: any, res: any) => {
        const logDir = path.resolve(process.cwd(), '.logs');
        const logFile = path.join(logDir, 'app.log');
        try {
          if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
          fs.writeFileSync(logFile, '', 'utf8');
          res.statusCode = 204;
          res.end();
        } catch {
          res.statusCode = 500;
          res.end('Clear error');
        }
      });
    }
  };
}

// Unified Vite config
export default defineConfig(({ mode }) => ({
  base: '/MSM/',
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      }
    }
  },
  server: {
    host: 'localhost',
    port: 8090,
    strictPort: true,
  },
  plugins: [
    react(),
    loggingMiddleware(),
    // mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
