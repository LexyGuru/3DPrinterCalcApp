import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@features': path.resolve(__dirname, './src/features'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@core': path.resolve(__dirname, './src/core'),
    }
  },
  server: {
    hmr: {
      overlay: true
    },
    // Cache kikapcsolása dev módban - így minden változás azonnal megjelenik
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  },
  build: {
    // Cache busting a build fájlokhoz
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Manual chunks optimalizálás - jobb code splitting és cache-elés
        manualChunks: (id) => {
          // node_modules chunk-ok
          if (id.includes('node_modules')) {
            // React és React-DOM külön chunk (nagyok, ritkán változnak, jó cache-elés)
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            
            // Tauri API-k külön chunk (platform specifikus, ritkán változik)
            if (id.includes('@tauri-apps')) {
              return 'vendor-tauri';
            }
            
            // UI library-k (framer-motion, recharts) külön chunk
            // Ezek nagyobb library-k, külön chunk-ba érdemes őket tenni
            if (id.includes('framer-motion')) {
              return 'vendor-ui-framer';
            }
            if (id.includes('recharts')) {
              return 'vendor-ui-charts';
            }
            
            // Egyéb node_modules egy nagy vendor chunk-ba
            return 'vendor';
          }
          
          // Route-based chunking - a lazy loading miatt automatikusan külön chunk-okba kerülnek
          // Itt csak a route wrapper fájlt csoportosítjuk
          if (id.includes('/router/routeWrappers')) {
            return 'routes';
          }
          
          // Router fájlok (routes.tsx, AppRouter.tsx, AppContext.tsx)
          if (id.includes('/router/') && !id.includes('routeWrappers')) {
            return 'router';
          }
          
          // Komponensek chunk-okba csoportosítása (csak ha nem lazy loaded)
          // A lazy loaded komponensek automatikusan külön chunk-okba kerülnek
          if (id.includes('/components/') && !id.includes('node_modules')) {
            // Közös utility komponensek (Header, Sidebar, stb.)
            const sharedComponents = ['Header', 'Sidebar', 'Tooltip', 'Modal', 'Toast', 'LoadingSpinner'];
            const componentMatch = id.match(/components\/([^/]+)/);
            if (componentMatch) {
              const componentName = componentMatch[1];
              if (sharedComponents.some(name => componentName.includes(name))) {
                return 'components-shared';
              }
            }
            // Egyéb komponensek (ha nem lazy loaded)
            return 'components';
          }
        }
      }
    },
    // Töröljük a régi fájlokat build előtt
    emptyOutDir: true,
    // Chunk size warning limit növelése (nagyobb vendor chunk-ok miatt)
    chunkSizeWarningLimit: 1000
  },
  // Force re-optimize dependencies dev módban
  optimizeDeps: {
    force: true
  }
})
