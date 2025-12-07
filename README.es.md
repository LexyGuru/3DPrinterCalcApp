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
- 🔒 **Cifrado de datos de clientes** - Cifrado AES-256-GCM para datos de clientes, protección de datos conforme al RGPD/UE, protección opcional con contraseña
- 📊 **Historial y tendencias de precios** - Seguimiento de cambios de precios de filamento con gráficos y estadísticas
- 🌍 **Multilingüe** - Traducción completa en húngaro, inglés, alemán, francés, chino simplificado, checo, español, italiano, polaco, portugués, eslovaco, ucraniano y ruso (14 idiomas, 850+ claves de traducción por idioma)
- 💱 **Múltiples monedas** - EUR, HUF, USD, GBP, PLN, CZK, CNY, UAH, RUB (9 monedas)
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

## 🌿 Estructura de ramas

- **`main`**: Versiones de lanzamiento estables (compilación RELEASE)
- **`beta`**: Versiones beta y desarrollo (compilación BETA)

Al hacer push a la rama `beta`, el workflow de GitHub Actions se ejecuta automáticamente, compilando la versión beta.

## 📋 Historial de versiones

For detailed version history and changelog, please see [RELEASE.es.md](RELEASE.es.md).

---

**Versión**: 1.6.0

Si tienes alguna pregunta o encuentras un error, ¡por favor abre un issue en el repositorio de GitHub!

