# 🖨️ 3D Printer Calculator App

> **🌍 Selección de idioma**
> 
> [🇬🇧 English](README.en.md) | [🇭🇺 Magyar](README.hu.md) | [🇩🇪 Deutsch](README.de.md) | [🇪🇸 Español](README.es.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇨🇿 Čeština](README.cs.md) | [🇸🇰 Slovenčina](README.sk.md) | [🇵🇹 Português](README.pt.md) | [🇫🇷 Français](README.fr.md) | [🇨🇳 中文](README.zh.md) | [🇺🇦 Українська](README.uk.md) | [🇷🇺 Русский](README.ru.md)

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
- 🎨 **Biblioteca de colores de filamento** - Más de 12,000 colores de fábrica con paneles seleccionables basados en marca y tipo
- 💾 **Editor de biblioteca de filamentos** - Agregar/editar basado en modal, advertencias de duplicados y guardado persistente en `filamentLibrary.json`
- 🖼️ **Imágenes de filamento en PDF** - Mostrar logotipos de filamento y muestras de color en PDFs generados
- 🧾 **Importación G-code y creación de borrador** - Cargar exportaciones G-code/JSON (Prusa, Cura, Orca, Qidi) desde modal en calculadora, con resumen detallado y generación automática de borrador de cotización
- 📈 **Estadísticas** - Panel de resumen para consumo de filamento, ingresos, ganancias
- 👥 **Base de datos de clientes** - Gestión de clientes con información de contacto, detalles de empresa y estadísticas de ofertas
- 📊 **Historial y tendencias de precios** - Seguimiento de cambios de precios de filamento con gráficos y estadísticas
- 🌍 **Multilingüe** - Traducción completa en húngaro, inglés, alemán, francés, chino simplificado, checo, español, italiano, polaco, portugués, eslovaco, ucraniano y ruso (14 idiomas, 850+ claves de traducción por idioma)
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
- 🍎 **Funciones específicas de plataforma** - Badge de Dock de macOS, notificaciones nativas, integración de bandeja del sistema

## 📋 Registro de cambios (Changelog)

### v1.2.1 (2025) - 🎨 Consistencia UI y gestión de columnas

- 📊 **Gestión de columnas de filamentos** - Agregada visibilidad y ordenamiento de columnas al componente Filamentos:
  - Menú de alternancia de visibilidad de columnas (igual que componente Impresoras)
  - Columnas ordenables: Marca, Tipo, Peso, Precio/kg
  - Preferencias de visibilidad de columnas guardadas en configuración
  - UI consistente con componente Impresoras (botón gestionar, menú desplegable, indicadores de ordenamiento)
- 🎨 **Consistencia de colores de tema** - Mejorado uso de colores de tema en todos los componentes:
  - Todos los botones y menús desplegables ahora usan consistentemente colores de tema (Filamentos, Impresoras, Calculadora, Tendencias de precios)
  - Eliminados colores hardcoded (botones grises reemplazados con color de tema primario)
  - Componente Header se adapta completamente a todos los temas y colores
  - Tarjeta de información de estado usa colores de tema en lugar de valores rgba hardcoded
  - Efectos hover consistentes usando themeStyles.buttonHover
- 🔧 **Mejoras UI**:
  - Botón "Gestionar columnas" ahora usa color de tema primario en lugar de secundario
  - Menú desplegable select de Tendencias de precios usa estilos de foco apropiados
  - Todos los menús desplegables estilizados consistentemente con colores de tema
  - Mejor consistencia visual en todas las páginas

### v1.1.6 (2025) - 🌍 Cobertura de traducción completa

- 🌍 **Traducciones del tutorial** - Se agregaron las claves de traducción del tutorial faltantes a todos los archivos de idioma:
  - 8 nuevos pasos del tutorial completamente traducidos (Panel de estado, Vista previa PDF, Arrastrar y soltar, Menú contextual, Historial de precios, Comparación de precios en línea, Exportar/Importar, Copia de seguridad)
  - Todo el contenido del tutorial ahora está disponible en los 14 idiomas admitidos
  - Experiencia completa del tutorial en checo, español, francés, italiano, polaco, portugués, ruso, eslovaco, ucraniano y chino
- 🎨 **Traducción de nombres de temas** - Los nombres de los temas ahora están completamente traducidos en todos los idiomas:
  - 15 nombres de temas agregados a todos los archivos de idioma (Claro, Oscuro, Azul, Verde, Bosque, Morado, Naranja, Pastel, Carbón, Medianoche, Degradado, Neón, Cyberpunk, Atardecer, Océano)
  - Los nombres de los temas se cargan dinámicamente desde el sistema de traducción en lugar de valores codificados
  - Mecanismo de respaldo: clave de traducción → displayName → nombre del tema
  - Todos los temas ahora se muestran en el idioma seleccionado por el usuario en Configuración

### v1.1.5 (2025) - 🎨 Mejoras de UI y gestión de registros

- 🎨 **Rediseño del diálogo de agregar filamento** - Diseño de dos columnas mejorado para mejor organización:
  - Columna izquierda: Datos básicos (Marca, Tipo, Peso, Precio, Carga de imagen)
  - Columna derecha: Selección de color con todas las opciones de color
  - Todos los campos de entrada tienen ancho consistente
  - Mejor jerarquía visual y espaciado
  - Carga de imagen movida a la columna izquierda debajo del campo Precio
- 📋 **Gestión de archivos de registro** - Nueva sección de gestión de registros en la configuración de Gestión de datos:
  - Eliminación automática configurable de archivos de registro antiguos (5, 10, 15, 30, 60, 90 días o nunca)
  - Botón para abrir la carpeta de registros en el administrador de archivos
  - Limpieza automática cuando se cambia la configuración
  - Apertura de carpetas específica de plataforma (macOS, Windows, Linux)
- 📦 **Diseño de Exportar/Importar** - Las secciones Exportar e Importar ahora están lado a lado:
  - Diseño responsivo de dos columnas
  - Mejor utilización del espacio
  - Balance visual mejorado
- 🍎 **Advertencia de notificación de macOS** - Diálogo de advertencia descartable:
  - Solo aparece en la plataforma macOS
  - Dos opciones de descarte: temporal (botón X) o permanente (botón Cerrar)
  - Descarte temporal: oculto solo para la sesión actual, reaparece después del reinicio
  - Descarte permanente: guardado en configuración, nunca aparece de nuevo
  - Distinción visual clara entre tipos de descarte

### v1.1.4 (2025) - 🐛 Creación automática del archivo de actualización de la biblioteca de filamentos

- 🐛 **Creación automática del archivo de actualización** - Corregido problema donde `update_filamentLibrary.json` no se creaba automáticamente:
  - El archivo ahora se crea automáticamente desde `filamentLibrarySample.json` en el primer inicio
  - Asegura que el archivo de actualización esté siempre disponible para la fusión
  - Solo crea si el archivo no existe (no sobrescribe el existente)
  - Manejo de errores y registro mejorados para operaciones de archivo de actualización

### v1.1.3 (2025) - 🪟 Correcciones de compatibilidad con Windows

- 🪟 **Corrección de compatibilidad con Windows** - Mejoras en la carga de la biblioteca de filamentos:
  - Importación dinámica para archivos JSON grandes (en lugar de importación estática)
  - Mecanismo de caché para evitar múltiples cargas
  - Manejo mejorado de errores para casos de archivo no encontrado en Windows
  - Compatibilidad multiplataforma (Windows, macOS, Linux)
- 🔧 **Mejoras en el manejo de errores** - Mensajes de error mejorados:
  - Manejo adecuado de mensajes de error específicos de Windows
  - Manejo silencioso de casos de archivo no encontrado (no como advertencias)

### v1.1.2 (2025) - 🌍 Selector de idioma y mejoras

- 🌍 **Selector de idioma en el primer inicio** - Diálogo moderno y animado de selección de idioma en el primer inicio:
  - Soporte para 13 idiomas con iconos de banderas
  - Diseño consciente del tema
  - Animaciones suaves
  - El tutorial se ejecuta en el idioma seleccionado
- 🔄 **Restablecimiento de fábrica** - Función de eliminación completa de datos:
  - Elimina todos los datos almacenados (impresoras, filamentos, ofertas, clientes, configuraciones)
  - Diálogo de confirmación para operaciones peligrosas
  - La aplicación se reinicia como en el primer inicio
- 🎨 **Mejoras de UI**:
  - Corrección de contraste del texto del pie de página (selección de color dinámica)
  - Guardado inmediato al cambiar el idioma
  - Posicionamiento mejorado de tooltips
- 📚 **Traducciones del tutorial** - Traducción completa del tutorial en todos los idiomas admitidos (ruso, ucraniano, chino agregados)

### v1.1.1 (2025) - 🎨 Mejoras de diseño del encabezado

- 📐 **Reorganización del encabezado** - Estructura de encabezado de tres partes:
  - Izquierda: Menú + Logo + Título
  - Centro: Breadcrumb (se reduce dinámicamente)
  - Derecha: Acciones rápidas + Tarjeta de información de estado
- 📊 **Tarjeta de información de estado** - Estilo compacto y moderno:
  - "Próximo guardado" (etiqueta y valor)
  - Fecha y hora (apiladas)
  - Siempre posicionada a la derecha
- 📱 **Diseño responsivo** - Puntos de quiebre mejorados:
  - Ocultar breadcrumb <1000px
  - Ocultar fecha <900px
  - Ocultar "Próximo guardado" <800px
  - Acciones rápidas compactas <700px
- 🔢 **Corrección de formato de números** - Redondeo de porcentajes de progreso de carga

### v1.1.0 (2025) - 🚀 Actualización de funciones

- 🔍 **Búsqueda global extendida** - Funcionalidad de búsqueda mejorada:
  - Buscar ofertas por nombre de cliente, ID, estado y fecha
  - Buscar filamentos de la base de datos (filamentLibrary) por marca, tipo y color
  - Agregar filamentos a la lista guardada con un clic desde los resultados de búsqueda
  - Resultados de búsqueda mejorados con indicadores de tipo
- 💀 **Sistema de carga Skeleton** - Experiencia de carga espectacular:
  - Componentes skeleton animados con efectos shimmer
  - Seguimiento de progreso con indicadores visuales
  - Pasos de carga con marcas de verificación para pasos completados
  - Transiciones suaves de desvanecimiento
  - Colores skeleton adaptados al tema
  - Cargadores skeleton específicos de página
- 🎨 **Mejoras de UI/UX**:
  - Mejores estados de carga
  - Retroalimentación mejorada del usuario durante la carga de datos
  - Experiencia visual mejorada

### v1.0.0 (2025) - 🎉 Primera versión estable

- 🎨 **Componentes UI modernos** - Renovación completa de la UI con componentes modernos:
  - Componente Empty State para mejor experiencia de usuario
  - Componente Card con efectos hover
  - Componente Progress Bar para operaciones de exportación/importación PDF
  - Componente Tooltip con integración de tema
  - Navegación Breadcrumb para jerarquía de páginas clara
- ⚡ **Acciones rápidas** - Botones de acción rápida en el encabezado para flujo de trabajo más rápido:
  - Botones de adición rápida para Filamentos, Impresoras y Clientes
  - Botones dinámicos basados en la página activa
  - Integración de atajos de teclado
- 🔍 **Búsqueda global (Command Palette)** - Funcionalidad de búsqueda potente:
  - `Ctrl/Cmd+K` para abrir la búsqueda global
  - Búsqueda de páginas y acciones rápidas
  - Navegación por teclado (↑↓, Enter, Esc)
  - Estilo adaptado al tema
- ⏪ **Funcionalidad Deshacer/Rehacer** - Gestión de historial para Filamentos:
  - `Ctrl/Cmd+Z` para deshacer
  - `Ctrl/Cmd+Shift+Z` para rehacer
  - Botones visuales deshacer/rehacer en la UI
  - Soporte de historial de 50 pasos
- ⭐ **Filamentos favoritos** - Marcar y filtrar filamentos favoritos:
  - Icono de estrella para alternar estado favorito
  - Filtro para mostrar solo favoritos
  - Estado favorito persistente
- 📦 **Operaciones en masa** - Gestión eficiente en masa:
  - Selección por casilla para múltiples filamentos
  - Funcionalidad Seleccionar todo / Deseleccionar todo
  - Eliminación en masa con diálogo de confirmación
  - Indicadores de selección visuales
- 🎨 **Diálogos modales** - Experiencia modal moderna:
  - Modales con fondo difuminado para formularios de agregar/editar
  - Campos de entrada de tamaño fijo
  - Tecla Escape para cerrar
  - Animaciones suaves con framer-motion
- ⌨️ **Atajos de teclado** - Sistema de atajos mejorado:
  - Atajos de teclado personalizables
  - Diálogo de ayuda de atajos (`Ctrl/Cmd+?`)
  - Editar atajos con captura de teclas
  - Almacenamiento persistente de atajos
- 📝 **Sistema de registro** - Registro completo:
  - Archivos de registro separados para frontend y backend
  - Resolución de directorio de registro independiente de plataforma
  - Rotación automática de registros
  - Integración de consola
- 🔔 **Mejoras de notificaciones** - Mejor sistema de notificaciones:
  - Nombre del cliente en notificaciones de eliminación de oferta
  - Soporte de notificaciones multiplataforma
  - Manejo de errores mejorado
- 🎯 **Mejoras UI/UX**:
  - Tamaños de campos de entrada fijos
  - Mejores diseños de formularios
  - Integración de tema mejorada
  - Accesibilidad mejorada

### v0.6.0 (2025)

#### 🐛 Correcciones de errores
- **Optimización de registro**: Reducción de registros excesivos y duplicados
  - Los registros informativos solo aparecen en modo desarrollo (DEV)
  - Los errores aún se registran en builds de producción
  - La inicialización de FilamentLibrary ocurre silenciosamente
- **Corrección de advertencias falsas**: La resolución de color de filamento solo advierte cuando la biblioteca ya está cargada y el color aún no se encuentra
  - Previene advertencias falsas durante la carga asíncrona de la biblioteca
  - Las advertencias solo aparecen para problemas reales
- **Corrección de duplicación del verificador de actualizaciones**: Eliminación de llamadas duplicadas de verificación de actualizaciones
- **Corrección de registro de atajos de teclado**: Solo registra cuando existe un atajo, omite combinaciones inválidas

#### ⚡ Mejoras de rendimiento
- Registro de operaciones de almacenamiento optimizado (solo modo DEV)
- Menos operaciones de consola en builds de producción
- Salida de consola más limpia durante el desarrollo

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

### v1.1.1 (2025) - 🎨 Mejoras de diseño del encabezado

- 🎨 **Rediseño del encabezado** - Revisión completa del diseño del encabezado:
  - Estructura de tres secciones (izquierda: logo/menú, centro: breadcrumb, derecha: acciones/estado)
  - Tarjeta de información de estado siempre posicionada en el extremo derecho
  - Diseño moderno tipo tarjeta para información de estado
  - Mejores espaciados y alineación en todo el encabezado
- 📱 **Diseño responsivo** - Mejor experiencia en móviles y pantallas pequeñas:
  - Puntos de quiebre dinámicos para visibilidad de elementos
  - Correcciones de truncamiento de breadcrumb
  - Acciones rápidas se adaptan al tamaño de pantalla
  - Tamaño responsivo de la tarjeta de información de estado
- 🔧 **Correcciones de diseño**:
  - Problemas de desbordamiento y truncamiento de breadcrumb corregidos
  - Mejoras en el posicionamiento de la tarjeta de información de estado
  - Mejor gestión del diseño flexbox
  - Espaciado y espacios mejorados entre elementos

### v1.1.0 (2025) - 🚀 Actualización de funciones

- 🔍 **Búsqueda global extendida** - Funcionalidad de búsqueda mejorada
- 💀 **Sistema de carga Skeleton** - Experiencia de carga espectacular
- 🎨 **Mejoras de UI/UX** - Mejores estados de carga y experiencia visual

### v1.0.0 (2025) - 🎉 Primera versión estable

- 🎨 **Componentes UI modernos** - Renovación completa de UI con componentes modernos
- ⚡ **Acciones rápidas** - Botones de acción rápida en el encabezado
- 🔍 **Búsqueda global** - Funcionalidad de búsqueda potente
- ⏪ **Funcionalidad Deshacer/Rehacer** - Gestión de historial
- ⭐ **Filamentos favoritos** - Marcar y filtrar filamentos favoritos
- 📦 **Operaciones masivas** - Gestión masiva eficiente
- 🎨 **Diálogos modales** - Experiencia modal moderna
- ⌨️ **Atajos de teclado** - Sistema de atajos mejorado
- 📝 **Sistema de registro** - Registro completo
- 🔔 **Mejoras de notificaciones** - Mejor sistema de notificaciones

### v0.6.0 (2025)

- 👥 **Base de datos de clientes** - Sistema completo de gestión de clientes con:
  - Agregar, editar, eliminar clientes
  - Información de contacto (correo electrónico, teléfono)
  - Detalles de empresa (opcional)
  - Dirección y notas
  - Estadísticas de clientes (total de ofertas, fecha de última oferta)
  - Funcionalidad de búsqueda
  - Integración con Calculadora para selección rápida de clientes
- 📊 **Historial y tendencias de precios** - Seguimiento de cambios de precios de filamento:
  - Seguimiento automático del historial de precios cuando se actualizan los precios de filamento
  - Visualización de tendencias de precios con gráficos SVG
  - Estadísticas de precios (precio actual, promedio, mínimo, máximo)
  - Análisis de tendencias (creciente, decreciente, estable)
  - Tabla de historial de precios con información detallada de cambios
  - Advertencias de cambios significativos de precios (cambios del 10%+)
  - Visualización del historial de precios en el componente Filamentos durante la edición
- 🔧 **Mejoras**:
  - Calculadora mejorada con menú desplegable de selección de clientes
  - Integración del historial de precios en el formulario de edición de filamento
  - Persistencia de datos mejorada para clientes e historial de precios

### v0.5.58 (2025)
- 🌍 **Soporte de idiomas ucraniano y ruso** – Se agregó soporte completo de traducción para ucraniano (uk) y ruso (ru):
  - Archivos de traducción completos con todas las 813 claves de traducción para ambos idiomas
  - Soporte de locale ucraniano (uk-UA) para formato de fecha/hora
  - Soporte de locale ruso (ru-RU) para formato de fecha/hora
  - Todos los archivos README actualizados con nuevos idiomas en el menú de idiomas
  - Recuento de idiomas actualizado de 12 a 14 idiomas
  - Archivos de documentación README.uk.md y README.ru.md creados

### v0.5.57 (2025)
- 🍎 **Platform-Specific Features** – Native platform integration for macOS, Windows, and Linux:
  - **macOS**: Dock badge support (numeric/textual badge on app icon), native Notification Center integration with permission management
  - **Windows**: Native Windows notifications
  - **Linux**: System tray integration, desktop notifications support
  - **All Platforms**: Native notification API integration with permission request system, platform detection and automatic feature enabling
- 🔔 **Notification System** – Native notification support with permission management:
  - Permission request system for macOS notifications
  - Notification test buttons in Settings
  - Automatic permission checking and status display
  - Platform-specific notification handling (macOS Notification Center, Windows Action Center, Linux desktop notifications)

### v0.5.56 (2025)
- 🌍 **Traducciones completas de idiomas** – Completadas las traducciones completas para 6 archivos de idioma restantes: checo (cs), español (es), italiano (it), polaco (pl), portugués (pt) y eslovaco (sk). Cada archivo contiene las 813 claves de traducción, por lo que la aplicación ahora está completamente soportada en estos idiomas.
- 🔒 **Corrección de permisos de Tauri** – El archivo `update_filamentLibrary.json` ahora está explícitamente habilitado para operaciones de lectura, escritura y creación en el archivo de capacidades de Tauri, asegurando que las actualizaciones de la biblioteca de filamentos funcionen de manera confiable.

### v0.5.55 (2025)
- 🧵 **Mejora de edición de cotizaciones** – Las cotizaciones guardadas ahora permiten la selección o modificación directa de la impresora, con costos recalculados automáticamente junto con los cambios de filamento.
- 🧮 **Precisión y registro** – El registro detallado ayuda a rastrear los pasos del cálculo de costos (filamento, electricidad, secado, uso), facilitando la búsqueda de errores en archivos G-code importados.
- 🌍 **Adiciones de traducción** – Nuevas claves y etiquetas i18n agregadas para el selector de impresora, asegurando una UI de editor consistente en todos los idiomas soportados.
- 📄 **Actualización de documentación** – README expandido con descripción de nuevas características, lanzamiento v0.5.55 agregado al historial de versiones.

### v0.5.11 (2025)
- 🗂️ **Modularización de idiomas** – Expansión de la aplicación con archivos de traducción organizados en un nuevo directorio `languages/`, facilitando agregar nuevos idiomas y gestionar textos existentes.
- 🌍 **Traducciones UI unificadas** – La interfaz de importación del slicer ahora funciona desde el sistema de traducción central, con todos los botones, mensajes de error y resúmenes localizados.
- 🔁 **Actualización del selector de idioma** – En Configuración, el selector de idioma se carga basándose en archivos de idioma descubiertos, por lo que en el futuro basta con agregar un nuevo archivo de idioma.
- 🌐 **Nuevas bases de idiomas** – Archivos de traducción preparados para francés, italiano, español, polaco, checo, eslovaco, portugués brasileño y chino simplificado (con fallback en inglés), las traducciones reales se pueden completar fácilmente.

### v0.5.0 (2025)
- 🔎 **Botón de comparación de precios de filamento** – Cada filamento personalizado ahora tiene un icono de lupa que abre la búsqueda de Google/Bing basada en marca/tipo/color, proporcionando enlaces rápidos a precios actuales.
- 💶 **Soporte de precio decimal** – Los campos de precio de filamento ahora aceptan decimales (14.11 € etc.), la entrada se valida y formatea automáticamente al guardar.
- 🌐 **Búsqueda inversa fallback** – Si el shell de Tauri no puede abrir el navegador, la aplicación abre automáticamente una nueva pestaña, por lo que la búsqueda funciona en todas las plataformas.

### v0.4.99 (2025)
- 🧾 **Importación de G-code integrada en la calculadora** – Nuevo modal `SlicerImportModal` en la parte superior de la calculadora que carga exportaciones G-code/JSON con un clic, transfiriendo tiempo de impresión, cantidad de filamento y creando un borrador de cotización.
- 📊 **Datos del slicer desde el encabezado** – Los valores del encabezado G-code `total filament weight/length/volume` toman automáticamente los resúmenes, manejando con precisión las pérdidas de cambio de color.

### v0.4.98 (2025)
- 🧵 **Soporte de filamento multicolor** – La biblioteca de filamentos y la UI de gestión ahora marcan por separado los filamentos multicolor (arcoíris/dual/tricolor) con notas y vista previa de arcoíris.
- 🌐 **Traducción automática en importación CSV** – Los nombres de colores importados de base de datos externa reciben etiquetas húngaras y alemanas, manteniendo el selector de color multilingüe sin edición manual.
- 🔄 **Fusión de biblioteca de actualización** – El contenido del archivo `update_filamentLibrary.json` se deduplica automáticamente y se fusiona con la biblioteca existente al iniciar, sin sobrescribir las modificaciones del usuario.
- 📁 **Actualización del convertidor CSV** – El script `convert-filament-csv.mjs` ya no sobrescribe el `filamentLibrary.json` persistente, sino que crea un archivo de actualización y genera etiquetas multilingües.
- ✨ **Ajuste de experiencia de animación** – Nuevas opciones de transición de página (flip, parallax), selector de estilo de microinteracción, retroalimentación pulsante, lista skeleton de biblioteca de filamentos y efectos hover de tarjeta afinados.
- 🎨 **Extensiones del taller de temas** – Cuatro nuevos temas integrados (Forest, Pastel, Charcoal, Midnight), duplicación instantánea del tema activo para edición personalizada, manejo mejorado de gradiente/contraste y proceso de compartir simplificado.

### v0.4.0 (2025)
- 🧵 **Integración de base de datos de filamentos** – Más de 12,000 colores de fábrica de biblioteca JSON integrada (instantánea de filamentcolors.xyz), organizados por marca y material
- 🪟 **Paneles de selector de tamaño fijo** – Listas de marca y tipo abiertas con botón, buscables, desplazables que se excluyen mutuamente, haciendo el formulario más transparente
- 🎯 **Mejoras del selector de color** – Cuando se reconocen elementos de la biblioteca, el acabado y el código hexadecimal se establecen automáticamente, campos separados disponibles al cambiar al modo personalizado
- 💾 **Editor de biblioteca de filamentos** – Nueva pestaña de configuración con formulario emergente, manejo de duplicados y guardado persistente `filamentLibrary.json` basado en Tauri FS
- 📄 **Actualización de documentación** – Nueva viñeta en la lista principal de características para la biblioteca de colores de filamentos, limpieza de README/FEATURE_SUGGESTIONS

### v0.3.9 (2025)
- 🔍 **Preajustes de filtro de cotizaciones** – Configuraciones de filtro guardables y nombrables, preajustes rápidos predeterminados (Hoy, Ayer, Semanal, Mensual etc.) y aplicar/eliminar con un clic
- 📝 **Notas de cambio de estado** – Nuevo modal para modificación del estado de cotización con nota opcional que se almacena en el historial de estado
- 🖼️ **Extensión de exportación PDF** – Las imágenes almacenadas con filamentos aparecen en la tabla PDF con estilo optimizado para impresión
- 🧾 **Hoja de datos de marca corporativa** – Nombre de empresa, dirección, ID fiscal, cuenta bancaria, contacto y carga de logotipo; incluido automáticamente en el encabezado PDF
- 🎨 **Selector de plantilla PDF** – Tres estilos (Moderno, Minimalista, Profesional) para elegir la apariencia de la cotización
- 👁️ **Vista previa PDF integrada** – Botón separado en los detalles de la cotización para verificación visual instantánea antes de exportar
- 📊 **Panel de estado** – Tarjetas de estado con resumen, filtros rápidos de estado y línea de tiempo de cambios de estado recientes en cotizaciones
- 📈 **Gráficos estadísticos** – Gráfico de tendencia ingresos/costo/beneficio, gráfico circular de distribución de filamentos, gráfico de barras de ingresos por impresora, todo exportable en formato SVG/PNG y también se puede guardar como PDF

### v0.3.8 (2025)
- 🐛 **Corrección de formato de números de informe** - Formato a 2 decimales en informes:
  - Tarjetas de estadísticas principales (Ingresos, Gastos, Beneficio, Cotizaciones): `formatNumber(formatCurrency(...), 2)`
  - Valores sobre gráficos: `formatNumber(formatCurrency(...), 2)`
  - Estadísticas detalladas (Beneficio promedio/cotización): `formatNumber(formatCurrency(...), 2)`
  - Ahora consistente con la página de inicio (p.ej. `6.45` en lugar de `6.45037688333333`)
- 🎨 **Corrección de navegación de pestañas de configuración** - Mejoras de color de fondo y texto:
  - Fondo de sección de navegación de pestañas: `rgba(255, 255, 255, 0.85)` para temas de gradiente + `blur(10px)`
  - Fondos de botones de pestaña: Activo `rgba(255, 255, 255, 0.9)`, inactivo `rgba(255, 255, 255, 0.7)` para temas de gradiente
  - Color de texto de botones de pestaña: `#1a202c` (oscuro) para temas de gradiente para legibilidad
  - Efectos hover: `rgba(255, 255, 255, 0.85)` para temas de gradiente
  - Filtro de fondo: `blur(8px)` para botones de pestaña, `blur(10px)` para sección de navegación

### v0.3.7 (2025)
- 🎨 **Modernización de diseño** - Transformación visual completa con animaciones y nuevos temas:
  - Nuevos temas: Gradient, Neon, Cyberpunk, Sunset, Ocean (5 nuevos temas modernos)
  - Animaciones Framer Motion integradas (fadeIn, slideIn, stagger, efectos hover)
  - Efecto glassmorphism para temas de gradiente (desenfoque + fondo transparente)
  - Efecto de resplandor neón para temas neón/cyberpunk
  - Tarjetas y superficies modernizadas (padding más grande, esquinas redondeadas, mejores sombras)
- 🎨 **Mejoras de color** - Mejor contraste y legibilidad para todos los temas:
  - Texto oscuro (#1a202c) en fondo blanco/claro para temas de gradiente
  - Campos de entrada, etiquetas, colorización h3 mejorada en todos los componentes
  - Manejo de color consistente en todas las páginas (Filaments, Printers, Calculator, Offers, Settings, Console)
  - Sombra de texto agregada para temas de gradiente para mejor legibilidad
- 📊 **Mejoras de estilo de tabla** - Fondo más difuminado y mejor contraste de texto:
  - Color de fondo: rgba(255, 255, 255, 0.85) para temas de gradiente (anteriormente 0.95)
  - Filtro de fondo: blur(8px) para efecto más difuminado
  - Color de texto: #333 (gris oscuro) para temas de gradiente para mejor legibilidad
  - Fondos de celda: rgba(255, 255, 255, 0.7) para efecto más difuminado
- 🎨 **Mejoras de color de fondo de tarjetas** - Fondo más difuminado, mejor legibilidad:
  - Color de fondo: rgba(255, 255, 255, 0.75) para temas de gradiente (anteriormente 0.95)
  - Filtro de fondo: blur(12px) para desenfoque más fuerte
  - Opacidad: 0.85 para efecto mate
  - Color de texto: #1a202c (oscuro) para temas de gradiente
- 📈 **Modernización de página de inicio** - Estadísticas semanales/mensuales/anuales y comparación de períodos:
  - Tarjetas de comparación de períodos (Semanal, Mensual, Anual) con barras de acento de colores
  - Componentes StatCard modernizados (iconos con fondos de colores, barras de acento)
  - Sección de resumen organizada en tarjetas con iconos
  - Sección de comparación de períodos agregada
- 🐛 **Corrección de filtro de fecha** - Filtrado de período más preciso:
  - Reinicio de tiempo (00:00:00) para comparación precisa
  - Límite superior establecido (hoy está incluido)
  - Semanal: últimos 7 días (hoy incluido)
  - Mensual: últimos 30 días (hoy incluido)
  - Anual: últimos 365 días (hoy incluido)
- 🎨 **Modernización de barra lateral** - Iconos, glassmorphism, efectos de resplandor neón
- 🎨 **Modernización de ConfirmDialog** - Prop de tema agregada, coloración armonizada

### v0.3.6 (2025)
- 🎨 **Reorganización de UI de configuración** - Sistema de pestañas (General, Apariencia, Avanzado, Gestión de datos) para mejor UX y navegación más limpia
- 🌐 **Mejoras de traducción** - Todo el texto húngaro codificado traducido en todos los componentes (HU/EN/DE):
  - Calculator: "cálculo de costos de impresión 3D"
  - Filaments: "Gestionar y editar filamentos"
  - Printers: "Gestionar impresoras y sistemas AMS"
  - Offers: "Gestionar y exportar cotizaciones guardadas"
  - Home: Títulos de estadísticas, resumen, etiquetas de exportación CSV (hora/Std/hrs, uds/Stk/pcs)
  - VersionHistory: "No hay historial de versiones disponible"
- 💾 **Sistema de caché de historial de versiones** - Guardado físico en localStorage, verificación de GitHub cada 1 hora:
  - Detección de cambios basada en suma de comprobación (solo descarga en nuevos lanzamientos)
  - Caché separado por idioma (Húngaro/Inglés/Alemán)
  - Cambio rápido de idioma desde caché (sin re-traducción)
  - Invalidación automática de caché en nuevo lanzamiento
- 🌐 **Traducción inteligente** - Solo traduce nuevos lanzamientos, usa traducciones antiguas desde caché:
  - Validación de caché (no cachear si mismo texto)
  - API MyMemory fallback si falla la traducción
  - Auto-reset del contador de errores (se restablece después de 5 minutos)
  - MAX_CONSECUTIVE_ERRORS: 10, MAX_RETRIES: 2
- 🔧 **LibreTranslate eliminado** - Solo uso de API MyMemory (errores 400 eliminados, solicitud GET, sin CORS)
- 🔄 **Refactorización de botón de reintento** - Mecanismo de activación más simple con useEffect
- 🐛 **Correcciones de errores de compilación** - Problemas de sangría JSX corregidos (sección Export/Import de Settings.tsx)

### v0.3.5 (2025)
- ✅ **Integración de API MyMemory** - API de traducción gratuita en lugar de LibreTranslate
- ✅ **Apertura de página de lanzamientos de GitHub** - Botón para abrir la página de lanzamientos de GitHub en límite de velocidad
- ✅ **Mejora del manejo de errores de límite de velocidad** - Mensajes de error claros y botón de reintento
- 🐛 **Correcciones de errores de compilación** - Imports no utilizados eliminados (offerCalc.ts)

### v0.3.4 (2025)
- ✅ **Mejora de validación de entrada** - Utilidad de validación central creada e integrada en componentes Calculator, Filaments, Printers
- ✅ **Mensajes de error de validación** - Mensajes de error multilingües (HU/EN/DE) con notificaciones toast
- ✅ **Optimización de rendimiento** - Componentes de carga diferida (división de código), optimización useMemo y useCallback
- ✅ **Inicialización específica de plataforma** - Fundamentos de inicialización específica de plataforma macOS, Windows, Linux
- 🐛 **Corrección de error de compilación** - Funciones de menú contextual Printers.tsx agregadas

### v0.3.3 (2025)
- 🖱️ **Funciones de arrastrar y soltar** - Reordenar cotizaciones, filamentos e impresoras arrastrando
- 📱 **Menús contextuales** - Menús de clic derecho para acciones rápidas (editar, eliminar, duplicar, exportar PDF)
- 🎨 **Retroalimentación visual** - Cambio de opacidad y cursor durante arrastrar y soltar
- 🔔 **Notificaciones toast** - Notificaciones después de reordenar
- 🐛 **Corrección de error de compilación** - Corrección Calculator.tsx theme.colors.error -> theme.colors.danger

### v0.3.2 (2025)
- 📋 **Funciones de plantilla** - Guardar y cargar cálculos como plantillas en componente Calculator
- 📜 **Historial/Versionado para cotizaciones** - Versionado de cotizaciones, ver historial, rastrear cambios
- 🧹 **Corrección de duplicación** - Funciones de exportación/importación CSV/JSON duplicadas eliminadas de componentes Filaments y Printers (permanecieron en Settings)

### v0.3.1 (2025)
- ✅ **Mejora de validación de entrada** - Números negativos deshabilitados, valores máximos establecidos (peso de filamento, tiempo de impresión, potencia, etc.)
- 📊 **Exportación/Importación CSV/JSON** - Exportación/importación masiva de filamentos e impresoras en formato CSV y JSON
- 📥 **Botones de Importar/Exportar** - Acceso fácil a funciones de exportación/importación en páginas Filaments y Printers
- 🎨 **Mejora de estados vacíos** - Estados vacíos informativos mostrados cuando no hay datos

### v0.3.0 (2025)
- ✏️ **Edición de cotizaciones** - Editar cotizaciones guardadas (nombre del cliente, contacto, descripción, porcentaje de beneficio, filamentos)
- ✏️ **Editar filamentos en cotización** - Modificar, agregar, eliminar filamentos dentro de la cotización
- ✏️ **Botón de editar** - Nuevo botón de editar junto al botón de eliminar en la lista de cotizaciones
- 📊 **Función de exportación de estadísticas** - Exportar estadísticas en formato JSON o CSV desde la página de inicio
- 📈 **Generación de informes** - Generar informes semanales/mensuales/anuales/todos en formato JSON con filtrado por período
- 📋 **Visualización del historial de versiones** - Ver historial de versiones en configuración, integración de API de GitHub Releases
- 🌐 **Traducción de lanzamientos de GitHub** - Traducción automática Húngaro -> Inglés/Alemán (API MyMemory)
- 💾 **Caché de traducción** - Caché localStorage para notas de lanzamiento traducidas
- 🔄 **Historial de versiones dinámico** - Versiones beta y release mostradas por separado
- 🐛 **Correcciones de errores** - Variables no utilizadas eliminadas, limpieza de código, errores de linter corregidos

### v0.2.55 (2025)
- 🖥️ **Función Console/Log** - Nuevo elemento de menú Console para depuración y visualización de registros
- 🖥️ **Configuración de Console** - Se puede habilitar la visualización del elemento de menú Console en configuración
- 📊 **Recopilación de registros** - Grabación automática de todos los mensajes console.log, console.error, console.warn
- 📊 **Grabación de errores globales** - Grabación automática de eventos de error de ventana y rechazo de promesa no manejado
- 🔍 **Filtrado de registros** - Filtrar por nivel (all, error, warn, info, log, debug)
- 🔍 **Exportación de registros** - Exportar registros en formato JSON
- 🧹 **Eliminación de registros** - Eliminar registros con un botón
- 📜 **Auto-scroll** - Desplazamiento automático a nuevos registros
- 💾 **Registro completo** - Todas las operaciones críticas registradas (guardar, exportar, importar, eliminar, exportar PDF, descargar actualización)
- 🔄 **Corrección de botón de actualización** - El botón de descarga ahora usa el plugin shell de Tauri, funciona de manera confiable
- 🔄 **Registro de actualización** - Registro completo de verificación y descarga de actualización
- ⌨️ **Atajos de teclado** - `Ctrl/Cmd+N` (nuevo), `Ctrl/Cmd+S` (guardar), `Escape` (cancelar), `Ctrl/Cmd+?` (ayuda)
- ⌨️ **Corrección de atajos de teclado macOS** - Manejo de Cmd vs Ctrl, manejo de eventos de fase de captura
- ⏳ **Estados de carga** - Componente LoadingSpinner para estados de carga
- 💾 **Respaldo y restauración** - Respaldo y restauración completa de datos con diálogo Tauri y plugins fs
- 🛡️ **Límites de error** - React ErrorBoundary para manejo de errores a nivel de aplicación
- 💾 **Guardado automático** - Guardado automático con límite de tiempo con intervalo configurable (predeterminado 30 segundos)
- 🔔 **Configuración de notificaciones** - Notificaciones toast encendido/apagado y configuración de duración
- ⌨️ **Menú de ayuda de atajos** - Lista de atajos de teclado en ventana modal (`Ctrl/Cmd+?`)
- 🎬 **Animaciones y transiciones** - Transiciones suaves y animaciones de fotogramas clave (fadeIn, slideIn, scaleIn, pulse)
- 💬 **Tooltips** - Ayuda contextual para todos los elementos importantes al pasar el mouse
- 🐛 **Corrección de error de renderizado de React** - Operación asíncrona del registrador de consola para que no bloquee el renderizado
- 🔧 **Actualización num-bigint-dig** - Actualizado a v0.9.1 (corrección de advertencia de deprecación)

### v0.2.0 (2025)
- 🎨 **Sistema de temas** - 6 temas modernos (Claro, Oscuro, Azul, Verde, Púrpura, Naranja)
- 🎨 **Selector de temas** - Tema seleccionable en configuración, surte efecto inmediatamente
- 🎨 **Integración completa de temas** - Todos los componentes (Filaments, Printers, Calculator, Offers, Home, Settings, Sidebar) usan temas
- 🎨 **Colores dinámicos** - Todos los colores codificados reemplazados con colores de tema
- 🎨 **Tema responsivo** - Las cotizaciones y el pie de página de la barra lateral también usan temas
- 💱 **Conversión de moneda dinámica** - Las cotizaciones ahora se muestran en la moneda de configuración actual (conversión automática)
- 💱 **Cambio de moneda** - La moneda cambiada en configuración afecta inmediatamente la visualización de cotizaciones
- 💱 **Conversión de moneda PDF** - La exportación PDF también se crea en la moneda de configuración actual
- 💱 **Conversión de precio de filamento** - Los precios de filamento también se convierten automáticamente

### v0.1.85 (2025)
- 🎨 **Mejoras UI/UX**:
  - ✏️ Iconos duplicados eliminados (Botones Editar, Guardar, Cancelar)
  - 📐 Secciones Exportar/Importar en diseño de 2 columnas (lado a lado)
  - 💾 Diálogo de guardado nativo usado para guardar PDF (diálogo Tauri)
  - 📊 Notificaciones toast para guardar PDF (éxito/error)
  - 🖼️ Tamaño de ventana de aplicación: 1280x720 (anteriormente 1000x700)
- 🐛 **Correcciones de errores**:
  - Información faltante agregada en generación PDF (customerContact, beneficio en línea separada, ingresos)
  - Claves de traducción agregadas (calculator.profit, calculator.revenue, calculator.totalPrice, offers.customerContact, common.close)
- 📄 **Mejoras de exportación PDF**:
  - Contacto del cliente (correo electrónico/teléfono) mostrado en PDF
  - Cálculo de beneficio en línea separada con porcentaje de beneficio
  - Ingresos (Precio Total) en línea separada, resaltado
  - Desglose completo de costos en PDF

### v0.1.56 (2025)
- ✨ **Mejoras de diseño de calculadora**: Desbordamiento de tarjetas de filamento corregido, diseño flexbox responsivo
- ✨ **Desglose de costos responsivo**: Ahora responde dinámicamente a cambios de tamaño de ventana
- 🐛 **Corrección de error**: El contenido no se desborda de la ventana al agregar filamento
- 🐛 **Corrección de error**: Todos los elementos de Calculator responden correctamente a cambios de tamaño de ventana

### v0.1.55 (2025)
- ✨ **Diálogos de confirmación**: Confirmación solicitada antes de eliminar (Filamentos, Impresoras, Cotizaciones)
- ✨ **Notificaciones toast**: Notificaciones después de operaciones exitosas (agregar, actualizar, eliminar)
- ✨ **Validación de entrada**: Números negativos deshabilitados, valores máximos establecidos
- ✨ **Estados de carga**: Spinner de carga al iniciar la aplicación
- ✨ **Límite de error**: Manejo de errores a nivel de aplicación
- ✨ **Búsqueda y filtro**: Buscar filamentos, impresoras y cotizaciones
- ✨ **Duplicación**: Duplicación fácil de cotizaciones
- ✨ **Formularios colapsables**: Los formularios de agregar filamento e impresora son colapsables
- ✨ **Extensiones de cotización**: Campos de nombre del cliente, contacto y descripción agregados
- 🐛 **Limpieza de Console.log**: No hay console.logs en la compilación de producción
- 🐛 **Corrección de campo de descripción**: Los textos largos se ajustan correctamente.

---

**Versión**: 1.2.1

Si tienes alguna pregunta o encuentras un error, ¡por favor abre un issue en el repositorio de GitHub!

