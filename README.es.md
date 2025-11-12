# 🖨️ 3D Printer Calculator App

> **🌍 Selección de idioma**
> 
> [🇬🇧 English](README.en.md) | [🇭🇺 Magyar](README.hu.md) | [🇩🇪 Deutsch](README.de.md) | [🇪🇸 Español](README.es.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇨🇿 Čeština](README.cs.md) | [🇸🇰 Slovenčina](README.sk.md) | [🇵🇹 Português](README.pt.md) | [🇫🇷 Français](README.fr.md) | [🇨🇳 中文](README.zh.md)

Una aplicación de escritorio moderna para calcular costos de impresión 3D. Construida con Tauri v2, frontend React y backend Rust.

## ✨ Características

- 📊 **Cálculo de costos** - Cálculo automático de costos de filamento, electricidad, secado y desgaste
- 🧵 **Gestión de filamentos** - Agregar, editar, eliminar filamentos (marca, tipo, color, precio)
- 🖨️ **Gestión de impresoras** - Gestionar impresoras y sistemas AMS
- 💰 **Cálculo de ganancias** - Porcentaje de ganancia seleccionable (10%, 20%, 30%, 40%, 50%)
- 📄 **Cotizaciones** - Guardar, gestionar y exportar cotizaciones PDF (nombre del cliente, contacto, descripción)
- 🧠 **Presets de filtros** - Guardar filtros de cotizaciones, aplicar presets rápidos, filtros automáticos basados en fecha/hora
- 🗂️ **Panel de estado** - Tarjetas de estado, filtros rápidos y línea de tiempo de cambios de estado recientes
- 📝 **Notas de estado** - Cada cambio de estado con notas opcionales y registro de historial
- 👁️ **Vista previa PDF y plantillas** - Vista previa PDF integrada, plantillas seleccionables y bloques de marca de empresa
- 🎨 **Biblioteca de colores de filamento** - Más de 2000 colores de fábrica con paneles seleccionables basados en marca y tipo
- 💾 **Editor de biblioteca de filamentos** - Agregar/editar basado en modal, advertencias de duplicados y guardado persistente en `filamentLibrary.json`
- 🖼️ **Imágenes de filamento en PDF** - Mostrar logotipos de filamento y muestras de color en PDFs generados
- 🧾 **Importación G-code y creación de borrador** - Cargar exportaciones G-code/JSON (Prusa, Cura, Orca, Qidi) desde modal en calculadora, con resumen detallado y generación automática de borrador de cotización
- 📈 **Estadísticas** - Panel de resumen para consumo de filamento, ingresos, ganancias
- 🌍 **Multilingüe** - Traducción completa en húngaro, inglés, alemán, francés, chino simplificado, checo, español, italiano, polaco, portugués y eslovaco (12 idiomas, 813 claves de traducción por idioma)
- 💱 **Múltiples monedas** - EUR, HUF, USD
- 🔄 **Actualizaciones automáticas** - Verifica GitHub Releases para nuevas versiones
- 🧪 **Versiones beta** - Soporte para branch beta y build beta
- ⚙️ **Verificación beta** - Verificación configurable de versiones beta
- 🎨 **Diseño responsivo** - Todos los elementos de la aplicación se adaptan dinámicamente al tamaño de la ventana
- ✅ **Diálogos de confirmación** - Solicitud de confirmación antes de eliminar
- 🔔 **Notificaciones toast** - Notificaciones después de operaciones exitosas
- 🔍 **Búsqueda y filtrado** - Buscar filamentos, impresoras y cotizaciones
- 🔎 **Comparación de precios en línea** - Un clic abre resultados de búsqueda Google/Bing para el filamento seleccionado, precio actualizable al instante
- 📋 **Duplicación** - Duplicación fácil de cotizaciones
- 🖱️ **Arrastrar y soltar** - Reordenar cotizaciones, filamentos e impresoras arrastrando
- 📱 **Menús contextuales** - Menús de clic derecho para acciones rápidas (editar, eliminar, duplicar, exportar)

## 📸 Capturas de pantalla

La aplicación incluye:
- Panel de inicio con estadísticas
- Gestión de filamentos
- Gestión de impresoras
- Calculadora de cálculo de costos
- Lista de cotizaciones y vista detallada
- Panel de estado y línea de tiempo
- Exportación PDF y vista previa integrada

## 🚀 Instalación

### Requisitos previos

- **Rust**: [Instalar Rust](https://rustup.rs/)
- **Node.js**: [Instalar Node.js](https://nodejs.org/) (versión 20+)
- **pnpm**: `npm install -g pnpm`
- **Tauri CLI**: `cargo install tauri-cli`

### Específico de macOS

```bash
# Xcode Command Line Tools
xcode-select --install
```

### Específico de Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
```

### Específico de Windows

- Visual Studio Build Tools (herramientas de compilación C++)
- Windows SDK

## 📦 Compilación

### Ejecución en modo de desarrollo

```bash
cd src-tauri
cargo tauri dev
```

### Compilación de producción (Crear aplicación independiente)

```bash
cd src-tauri
cargo tauri build
```

La aplicación independiente se ubicará en:
- **macOS**: `src-tauri/target/release/bundle/macos/3DPrinterCalcApp.app`
- **Linux**: `src-tauri/target/release/bundle/deb/` o `appimage/`
- **Windows**: `src-tauri/target/release/bundle/msi/`

### Compilación beta

El proyecto incluye una rama `beta` configurada para compilaciones separadas:

```bash
# Cambiar a rama beta
git checkout beta

# Compilación beta local
./build-frontend.sh
cd src-tauri
cargo tauri build
```

La compilación beta establece automáticamente la variable `VITE_IS_BETA=true`, por lo que aparece "BETA" en el menú.

**GitHub Actions**: Al hacer push a la rama `beta`, el workflow `.github/workflows/build-beta.yml` se ejecuta automáticamente, compilando la versión beta para las tres plataformas.

Guía detallada: [BUILD.md](BUILD.md) y [HOW_TO_BUILD_APP.md](HOW_TO_BUILD_APP.md)

## 💻 Desarrollo

### Estructura del proyecto

```
3DPrinterCalcApp/
├── frontend/          # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── utils/        # Funciones auxiliares
│   │   └── types.ts      # Tipos TypeScript
│   └── package.json
├── src-tauri/         # Backend Rust
│   ├── src/           # Código fuente Rust
│   ├── Cargo.toml     # Dependencias Rust
│   └── tauri.conf.json # Configuración Tauri
└── README.md
```

### Desarrollo frontend

```bash
cd frontend
pnpm install
pnpm dev
```

### Dependencias

**Frontend:**
- React 19
- TypeScript
- Vite

**Backend:**
- Tauri v2
- tauri-plugin-store (almacenamiento de datos)
- tauri-plugin-log (registro)

## 📖 Uso

1. **Agregar impresora**: Menú Impresoras → Agregar nueva impresora
2. **Agregar filamento**: Menú Filamentos → Agregar nuevo filamento
3. **Calcular costo**: Menú Calculadora → Seleccionar impresora y filamentos
4. **Guardar cotización**: Hacer clic en el botón "Guardar como cotización" en la calculadora
5. **Exportar PDF**: Menú Cotizaciones → Seleccionar una cotización → Exportar PDF
6. **Verificar versiones beta**: Menú Configuración → Habilitar opción "Verificar actualizaciones beta"

## 🔄 Gestión de versiones y actualizaciones

La aplicación verifica automáticamente GitHub Releases para nuevas versiones:

- **Al iniciar**: Verifica automáticamente actualizaciones
- **Cada 5 minutos**: Verifica automáticamente nuevamente
- **Notificación**: Si hay una nueva versión disponible, aparece una notificación en la esquina superior derecha

### Verificación de versiones beta

Para verificar versiones beta:

1. Ve al menú **Configuración**
2. Habilita la opción **"Verificar actualizaciones beta"**
3. La aplicación verifica inmediatamente las versiones beta
4. Si hay una versión beta más nueva disponible, aparece una notificación
5. Haz clic en el botón "Descargar" para ir a la página de GitHub Release

**Ejemplo**: Si estás usando una versión RELEASE (p. ej., 0.1.0) y habilitas la verificación beta, la aplicación encuentra la última versión beta (p. ej., 0.2.0-beta) y te notifica si hay una más nueva.

Guía detallada: [VERSIONING.md](VERSIONING.md)

## 🛠️ Stack tecnológico

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Rust, Tauri v2
- **Almacenamiento de datos**: Tauri Store Plugin (archivos JSON)
- **Estilos**: Estilos inline (commonStyles)
- **i18n**: Sistema de traducción personalizado
- **CI/CD**: GitHub Actions (compilaciones automáticas para macOS, Linux, Windows)
- **Gestión de versiones**: Integración con API de GitHub Releases

## 📝 Licencia

Este proyecto está licenciado bajo **licencia MIT**, sin embargo, **el uso comercial requiere permiso**.

Copyright completo de la aplicación: **Lekszikov Miklós (LexyGuru)**

- ✅ **Uso personal y educativo**: Permitido
- ❌ **Uso comercial**: Solo con permiso escrito explícito

Detalles: archivo [LICENSE](LICENSE)

## 👤 Autor

Lekszikov Miklós (LexyGuru)

## 🙏 Agradecimientos

- [Tauri](https://tauri.app/) - El framework de aplicaciones de escritorio multiplataforma
- [React](https://react.dev/) - El framework frontend
- [Vite](https://vitejs.dev/) - La herramienta de compilación

## 📚 Documentación adicional

- [BUILD.md](BUILD.md) - Guía detallada de compilación para todas las plataformas
- [HOW_TO_BUILD_APP.md](HOW_TO_BUILD_APP.md) - Crear aplicación independiente
- [VERSIONING.md](VERSIONING.md) - Gestión de versiones y actualizaciones
- [CREATE_FIRST_RELEASE.md](CREATE_FIRST_RELEASE.md) - Crear primer GitHub Release

## 🌿 Estructura de ramas

- **`main`**: Versiones de lanzamiento estables (compilación RELEASE)
- **`beta`**: Versiones beta y desarrollo (compilación BETA)

Al hacer push a la rama `beta`, el workflow de GitHub Actions se ejecuta automáticamente, compilando la versión beta.

## 📋 Historial de versiones

### v0.5.56 (2025)
- 🌍 **Traducciones completas de idiomas** – Completadas las traducciones completas para 6 archivos de idioma restantes: checo (cs), español (es), italiano (it), polaco (pl), portugués (pt) y eslovaco (sk). Cada archivo contiene las 813 claves de traducción, por lo que la aplicación ahora está completamente soportada en estos idiomas.
- 🔒 **Corrección de permisos de Tauri** – El archivo `update_filamentLibrary.json` ahora está explícitamente habilitado para operaciones de lectura, escritura y creación en el archivo de capacidades de Tauri, asegurando que las actualizaciones de la biblioteca de filamentos funcionen de manera confiable.

### v0.5.55 (2025)
- 🧵 **Mejora de edición de cotizaciones** – Las cotizaciones guardadas ahora permiten la selección o modificación directa de la impresora, con costos recalculados automáticamente junto con los cambios de filamento.
- 🧮 **Precisión y registro** – El registro detallado ayuda a rastrear los pasos del cálculo de costos (filamento, electricidad, secado, uso), facilitando la búsqueda de errores en archivos G-code importados.
- 🌍 **Adiciones de traducción** – Nuevas claves y etiquetas i18n agregadas para el selector de impresora, asegurando una UI de editor consistente en todos los idiomas soportados.
- 📄 **Actualización de documentación** – README expandido con descripción de nuevas características, lanzamiento v0.5.55 agregado al historial de versiones.

---

**Versión**: 0.5.56

Si tienes alguna pregunta o encuentras un error, ¡por favor abre un issue en el repositorio de GitHub!

