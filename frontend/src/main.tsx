import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// RÉSZLETES LOGOLÁS - App inicializálás
console.log("🚀 [MAIN] main.tsx betöltve");
console.log("🚀 [MAIN] React, ReactDOM, BrowserRouter importálva");

// Error handling az app inicializálásához
console.log("🔍 [MAIN] Root element keresése...");
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ [MAIN] Root element nem található! Ellenőrizd, hogy az index.html tartalmazza a <div id="root"></div> elemet.');
  throw new Error('Root element not found');
}
console.log("✅ [MAIN] Root element található");

try {
  console.log("📦 [MAIN] React root létrehozása...");
  const root = createRoot(rootElement);
  console.log("✅ [MAIN] React root létrehozva");
  
  console.log("🎨 [MAIN] App komponens renderelése...");
  
  // Töröljük az HTML fallback UI-t, ha van
  const htmlLoading = document.getElementById('html-loading');
  if (htmlLoading) {
    htmlLoading.remove();
    console.log("🗑️ [MAIN] HTML fallback UI eltávolítva");
  }
  
  // Fallback UI azonnali megjelenítése (ha valami elakad)
  rootElement.innerHTML = '<div id="loading-fallback" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui; background: #1a1a1a; color: white;"><div style="font-size: 24px; margin-bottom: 20px;">⏳ React betöltése...</div><div style="font-size: 12px; color: #888;" id="main-status">Várakozás React renderelésre...</div></div>';
  console.log("📺 [MAIN] Fallback UI megjelenítve");
  
  // Status frissítés
  const statusEl = document.getElementById('main-status');
  if (statusEl) {
    statusEl.textContent = 'React root létrehozása...';
  }
  
  // Kis késleltetés, hogy látható legyen a fallback
  setTimeout(() => {
    console.log("🔄 [MAIN] Fallback UI eltávolítása, React renderelés...");
    if (statusEl) {
      statusEl.textContent = 'React renderelés...';
    }
    
    rootElement.innerHTML = ''; // Töröljük a fallback UI-t
    
    root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
    );
    console.log("✅ [MAIN] App komponens renderelve");
  }, 100);
} catch (error) {
  console.error('❌ [MAIN] Hiba az app renderelésekor:', error);
  console.error('❌ [MAIN] Hiba részletei:', {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  });
  // Fallback UI megjelenítése
  rootElement.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui; padding: 20px; text-align: center;">
      <h1 style="color: #ff4444; margin-bottom: 20px;">❌ Alkalmazás betöltési hiba</h1>
      <p style="color: #666; margin-bottom: 10px;">Az alkalmazás nem tudott betöltődni.</p>
      <p style="color: #666; margin-bottom: 20px; font-family: monospace; font-size: 12px;">${error instanceof Error ? error.message : String(error)}</p>
      <button onclick="window.location.reload()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Újratöltés
      </button>
    </div>
  `;
}
