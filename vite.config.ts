import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/KIN-website/',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          static_home: resolve(__dirname, 'index.static.html'),
          about: resolve(__dirname, 'about.html'),
          community: resolve(__dirname, 'community.html'),
          content: resolve(__dirname, 'content.html'),
          programs: resolve(__dirname, 'programs.html'),
          prayer: resolve(__dirname, 'prayer.html'),
          progress: resolve(__dirname, 'progress.html'),
          support: resolve(__dirname, 'support.html'),
          grace_generator: resolve(__dirname, 'grace_generator.html'),
          offline: resolve(__dirname, 'offline.html')
        }
      }
    }
  };
});
