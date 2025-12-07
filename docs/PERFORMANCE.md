# Performance Optimalizálás és Code Splitting Dokumentáció

## Áttekintés

Ez a dokumentum leírja a 3D Printer Calc App performance optimalizálási stratégiáit és code splitting implementációját.

---

## 1. React.lazy() Implementáció

### Jelenlegi Állapot

Az alkalmazás jelenleg **React.lazy()** használatával implementálja a code splitting-et. A következő komponensek lazy loading-gal vannak betöltve:

- `Home`
- `Filaments`
- `FilamentStockManagement`
- `Printers`
- `Calculator`
- `Offers`
- `Customers`
- `PriceTrends`
- `Calendar`
- `Projects`
- `Tasks`
- `SettingsPage`
- `Console`
- `BudgetManagement`

### Implementáció

```typescript
// App.tsx
const Home = lazy(() => import("./components/Home").then(module => ({ default: module.Home })));
const Filaments = lazy(() => import("./components/Filaments").then(module => ({ default: module.Filaments })));
// ... stb.
```

### Működés

1. **Loading fázis** (`isInitialized === false`):
   - Csak az `AppSkeleton` komponens jelenik meg
   - Az adatok betöltődnek (settings, printers, filaments, stb.)
   - A komponensek **NEM** töltődnek be ebben a fázisban

2. **Inicializálás után** (`isInitialized === true`):
   - A `Suspense` wrapper aktív
   - A lazy komponensek csak akkor töltődnek be, amikor először használod őket
   - Például: ha `activePage === "settings"`, akkor csak a `SettingsPage` komponens töltődik be

### Előnyök

- ✅ Gyorsabb kezdeti betöltés (csak a szükséges komponens töltődik be)
- ✅ Kisebb kezdeti bundle méret
- ✅ Jobb felhasználói élmény (gyorsabb app indítás)

---

## 2. Suspense Fallback

### Jelenlegi Implementáció

```typescript
<Suspense fallback={
  <div style={{ /* ... */ }}>
    <LoadingSpinner size="large" message={t("loading.title")} />
  </div>
}>
  {PageComponent}
</Suspense>
```

### Optimalizálási Lehetőségek

- [ ] Komponens-specifikus fallback-ek (különböző loading UI különböző oldalakhoz)
- [ ] Skeleton screen-ek (jobban illeszkedik a tényleges tartalomhoz)
- [ ] Progress indicator (ha a komponens betöltése hosszabb)

---

## 3. Error Boundary

### Jelenlegi Állapot

Az alkalmazásnak van egy `ErrorBoundary` komponense, de nincs specifikus error boundary a lazy komponensekhez.

### Javasolt Implementáció

```typescript
// LazyErrorBoundary.tsx
class LazyErrorBoundary extends React.Component {
  // Error handling lazy komponensekhez
}
```

### Előnyök

- ✅ Lazy komponens betöltési hibák kezelése
- ✅ Felhasználóbarát hibaüzenetek
- ✅ Fallback UI hiba esetén

---

## 4. Route-based Code Splitting (Tervezett)

### Jelenlegi Navigáció

Az alkalmazás jelenleg **state-based navigációt** használ:

```typescript
const [activePage, setActivePage] = useState("home");

// Navigáció
setActivePage("settings");
```

### Tervezett Átállás Routing-ra

**React Router** integrációval:

```typescript
// Tervezett struktúra
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/settings" element={<SettingsPage />} />
  <Route path="/offers" element={<Offers />} />
  // ... stb.
</Routes>
```

### Előnyök

- ✅ URL alapú navigáció (`/settings`, `/offers`, stb.)
- ✅ Bookmark-olható oldalak
- ✅ Vissza gomb működik
- ✅ Jobb code splitting (minden route külön fájlba kerül)

---

## 5. Vite Build Optimalizálás

### Jelenlegi Konfiguráció

```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      entryFileNames: 'assets/[name]-[hash].js',
      chunkFileNames: 'assets/[name]-[hash].js',
      assetFileNames: 'assets/[name]-[hash].[ext]'
    }
  }
}
```

### Tervezett Optimalizálás

```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor': ['react', 'react-dom'],
        'ui': ['framer-motion', '@tauri-apps/api'],
        // Route-based chunks (routing implementálása után)
      }
    }
  }
}
```

### Előnyök

- ✅ Vendor chunk optimalizálás (node_modules külön chunk)
- ✅ Route-based chunking (minden route külön fájlba kerül)
- ✅ Kisebb bundle méretek
- ✅ Jobb cache-elés

---

## 6. Performance Metrikák

### Mérési Pontok

- **Initial Load Time**: Mennyi idő alatt töltődik be az app
- **Time to Interactive**: Mennyi idő alatt válik interaktívvá
- **Bundle Size**: Mennyi a teljes bundle méret
- **Chunk Sizes**: Mennyi az egyes chunk-ok mérete

### Monitoring

A performance metrikák már implementálva vannak a `frontend/src/utils/performance.ts` fájlban:
- `PerformanceTimer` - műveleti idők mérése
- `logMemoryUsage` - memória használat logolása
- `logPerformanceSummary` - összefoglaló metrikák

---

## 7. Best Practices

### Lazy Loading

1. ✅ Csak nagyobb komponenseket lazy load-oljunk
2. ✅ Ne lazy load-oljunk kis utility komponenseket
3. ✅ Használjunk Suspense fallback-et
4. ✅ Implementáljunk Error Boundary-t

### Code Splitting

1. ✅ Route-based splitting (ha routing van)
2. ✅ Vendor chunk optimalizálás
3. ✅ Manual chunks használata (ha szükséges)
4. ✅ Bundle size monitoring

### Performance

1. ✅ Memoization használata (`useMemo`, `useCallback`)
2. ✅ Virtual scrolling nagy listákhoz
3. ✅ Debouncing/throttling user input-okhoz
4. ✅ Image lazy loading

---

## 8. Következő Lépések

- [ ] React Router integráció
- [ ] Route-based code splitting
- [ ] Vite build konfiguráció optimalizálása
- [ ] Error Boundary lazy komponensekhez
- [ ] Suspense fallback optimalizálása
- [ ] Performance monitoring bővítése

---

**Utolsó frissítés**: v3.0.0 tervezés

