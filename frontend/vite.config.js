import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables from .env if present
  const env = loadEnv(mode, process.cwd(), '');
  // Default to http://localhost:5128 which is the primary dotnet run profile
  const apiTarget = env.VITE_API_TARGET || 'http://localhost:5128';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false, // Accepts dev SSL certificates if HTTPS target is specified
        },
      },
    },
  };
});
