import { defineConfig } from 'vite';

/** GitHub project Pages URL is /<repo-name>/; set VITE_BASE_PATH in CI (see workflow). */
const base = process.env.VITE_BASE_PATH ?? '/';

export default defineConfig({
  base,
  server: {
    allowedHosts: [
      '.loca.lt'
    ]
  }
});

