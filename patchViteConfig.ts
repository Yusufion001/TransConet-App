import fs from 'fs';

let content = fs.readFileSync('vite.config.ts', 'utf-8');

const buildConfig = `
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['lucide-react', 'motion'],
            map: ['@react-google-maps/api', '@vis.gl/react-google-maps'],
            supabase: ['@supabase/supabase-js']
          }
        }
      }
    },
`;

content = content.replace(/build: \{[\s\S]*?\},/, buildConfig);

fs.writeFileSync('vite.config.ts', content);
