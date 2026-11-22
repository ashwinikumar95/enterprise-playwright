import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root,
  appType: 'mpa',
  server: {
    port: 3100,
    host: '127.0.0.1',
    strictPort: true,
  },
  preview: {
    port: 3100,
    host: '127.0.0.1',
    strictPort: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(root, 'index.html'),
        signin: path.resolve(root, 'signin/index.html'),
        newTicket: path.resolve(root, 'new/index.html'),
        review: path.resolve(root, 'review/index.html'),
        done: path.resolve(root, 'done/index.html'),
        tickets: path.resolve(root, 'tickets/index.html'),
      },
    },
  },
});
