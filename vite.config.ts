import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/',
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'MyFedPlan',
          short_name: 'MyFedPlan',
          description: 'Federal retirement calculators including FERS, CSRS, TSP, and more.',
          theme_color: '#0B1F3A',
          background_color: '#F5F6F8',
          display: 'standalone',
          icons: [
            {
              src: 'https://i.postimg.cc/kXVHSmXz/Screenshot-2026-03-13-at-4-57-08-PM.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'https://i.postimg.cc/kXVHSmXz/Screenshot-2026-03-13-at-4-57-08-PM.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
