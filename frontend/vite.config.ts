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
        // Chunk betöltési sorrend biztosítása - vendor-react előbb, mint az index
        // Ez biztosítja, hogy a React.lazy elérhető legyen, amikor a routeWrappers betöltődik
        // A modulepreload sorrendjét a Vite automatikusan kezeli a chunk függőségek alapján
        // Manual chunks optimalizálás - jobb code splitting és cache-elés
        // KRITIKUS: A vendor-react chunk-nak előbb kell betöltődnie, mint a routes chunk-nak
        manualChunks: (id: string) => {
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
          
          // Router fájlok - NE csoportosítsuk külön chunk-ba, mert a routeWrappers React.lazy-t használ
          // A routes.tsx importálja a routeWrappers.tsx-t, ami React.lazy-t használ
          // Ha külön chunk-ba kerülnek, akkor a React.lazy nem lesz elérhető, mert a vendor-react chunk később töltődik be
          // Ezért mindkettőt az index chunk-ban hagyjuk, hogy biztosan elérjék a React.lazy-t
          // if (id.includes('/router/')) {
          //   return 'router';
          // }
          
          // Filament library fájlok külön chunk (nagyon nagyok, ritkán változnak)
          if (id.includes('filamentLibraryFromCsv') || id.includes('filamentLibrarySample')) {
            return 'data-filament-library';
          }
          
          // Features chunk-okba csoportosítása (feature-alapú code splitting)
          if (id.includes('/features/')) {
            const featureMatch = id.match(/features\/([^/]+)/);
            if (featureMatch) {
              const featureName = featureMatch[1];
              // Nagyobb feature-ök külön chunk-ba
              if (['calculator', 'offers', 'filaments'].includes(featureName)) {
                return `feature-${featureName}`;
              }
              // Egyéb feature-ök egy chunk-ba
              return 'features-other';
            }
          }
          
          // Komponensek - MINDEN KOMPONENS AZ INDEX CHUNK-BAN MARAD
          // A részletes chunking circular dependency és initialization order problémákat okoz
          // Ezért minden komponens (kivéve a lazy loaded-eket) az index chunk-ban marad
          // A lazy loaded komponensek automatikusan külön chunk-okba kerülnek
          if (id.includes('/components/') && !id.includes('node_modules')) {
            // MINDEN komponens az index chunk-ban marad
            // Ez biztosítja, hogy a React mindig elérhető legyen és nincs circular dependency
            return null; // null = marad az index chunk-ban
          }
          
          // Utils chunk-okba csoportosítása
          if (id.includes('/utils/') && !id.includes('node_modules')) {
            // Nagy utility fájlok külön chunk-ba
            if (id.includes('filamentLibrary') || id.includes('store') || id.includes('backup')) {
              return 'utils-large';
              }
            return 'utils';
          }
        }
      }
    },
    // Töröljük a régi fájlokat build előtt
    emptyOutDir: true,
    // Chunk size warning limit növelése (nagyobb vendor chunk-ok miatt)
    chunkSizeWarningLimit: 1000,
    // Jobb optimalizálás
    minify: 'esbuild',
    // Source maps production build-ben (opcionális, debug-hoz)
    sourcemap: false
  },
  // Force re-optimize dependencies dev módban
  optimizeDeps: {
    force: true
  }
})
