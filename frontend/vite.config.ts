import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return { root: __dirname,
    envDir: '../',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'react-native': 'react-native-web'
      },
      extensions: ['.web.js', '.web.jsx', '.web.ts', '.web.tsx', '.js', '.jsx', '.ts', '.tsx'],
    },
    optimizeDeps: {
      esbuildOptions: {
        resolveExtensions: ['.web.js', '.web.jsx', '.web.ts', '.web.tsx', '.js', '.jsx', '.ts', '.tsx'],
      },
    },
    define: {
      'process.env.GOOGLE_MAPS_PLATFORM_KEY': JSON.stringify(
        process.env.GOOGLE_MAPS_PLATFORM_KEY || process.env.VITE_GOOGLE_MAPS_PLATFORM_KEY || ''
      )
    },
    
    
    
    esbuild: { drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [] },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['lucide-react', 'motion'],
            map: ['@react-google-maps/api', '@vis.gl/react-google-maps'],
            supabase: ['@supabase/supabase-js'],
            firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            schema: ['zod'],
            realtime: ['socket.io-client']
          }
        }
      }
    },


    server: {
      proxy: {
        "/api": "http://127.0.0.1:3001"
      },
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
