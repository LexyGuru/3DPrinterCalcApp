# 📋 Historial de Versiones - 3DPrinterCalcApp

Este documento contiene el registro detallado de cambios para todas las versiones de la aplicación 3D Printer Calculator.

---

## v3.0.0 (2025) - 🔒 Cifrado de Datos de Clientes & Cumplimiento RGPD

### 🔒 Cifrado de Datos de Clientes
- **Cifrado AES-256-GCM** - Almacenamiento cifrado de datos de clientes utilizando el algoritmo estándar de la industria AES-256-GCM
- **Hashing de contraseñas PBKDF2** - Almacenamiento seguro de contraseñas utilizando el algoritmo PBKDF2 (100.000 iteraciones, SHA-256)
- **Almacenamiento en archivo separado** - Los datos cifrados de clientes se almacenan en un archivo separado `customers.json`
- **Gestión de contraseñas en memoria** - Las contraseñas se almacenan solo en memoria y se eliminan al cerrar la aplicación
- **Integración de contraseña de aplicación** - Opcional: la contraseña de protección de la aplicación también se puede usar para el cifrado
- **Sistema de solicitud de contraseña** - Solicitud inteligente de contraseña (no aparece en la pantalla de carga, después del mensaje de bienvenida)
- **Protección de integridad de datos** - Datos cifrados protegidos contra eliminación accidental

### ✅ Protección de Datos Conforme al RGPD/UE
- **Cumplimiento**: La aplicación maneja los datos de clientes de conformidad con el RGPD (Reglamento General de Protección de Datos) y las normativas de protección de datos de la UE
- **Cifrado estándar de la industria**: Uso del algoritmo AES-256-GCM (cumple con las recomendaciones de la UE)
- **Gestión segura de contraseñas**: Algoritmo de hash PBKDF2 (recomendado por NIST)
- **Recopilación mínima de datos**: Solo almacena los datos de clientes necesarios para la aplicación
- **Retención de datos**: El usuario tiene control total sobre el almacenamiento y eliminación de datos
- **Control de acceso**: Acceso protegido por contraseña a los datos de clientes

### 🎨 Mejoras de UI/UX
- **Modal de activación de cifrado** - Nuevo diálogo modal para activar el cifrado con opción de contraseña de aplicación
- **Mejora de ConfirmDialog** - Soporte para contenido personalizado en componentes modales
- **Temporización de solicitud de contraseña** - Visualización inteligente (no en la pantalla de carga)
- **Integración de configuración** - Configuraciones de cifrado en la pestaña Seguridad

### 🔧 Mejoras Técnicas
- **Módulo de cifrado del backend** - Cifrado implementado en Rust (`src-tauri/src/encryption.rs`)
- **Utilidades de cifrado del frontend** - Funciones auxiliares de TypeScript para el manejo de cifrado
- **Administrador de contraseñas** - Sistema de gestión de contraseñas en memoria
- **Integración de almacenamiento** - Funciones saveCustomers/loadCustomers con integración de cifrado

### 📚 Soporte de Idiomas
- **13 idiomas actualizados** - Nuevas claves de traducción de cifrado en todos los archivos de idioma
- **Nuevas claves**: `encryption.enableEncryption`, `encryption.useSamePasswordAsApp`, `encryption.encryptionPassword`, `encryption.passwordMinLength`

---

## v2.0.0 (2025) - 🚀 Monitoreo de Rendimiento & Sistema de Registro de Auditoría

### 🌐 Localización de Mensajes de la Consola
- **Localización completa de la consola** - Todos los mensajes de la consola se muestran en el idioma seleccionado
- **Traducción de operaciones de almacenamiento** - Mensajes de carga y guardado (impresoras, filamentos, configuración, ofertas, clientes, proyectos, tareas)
- **Traducción de mensajes de respaldo** - Verificación diaria de respaldo, creación de respaldo, mensajes de rotación
- **Traducción de mensajes de rotación de registros** - Mensajes de rotación de registros y registros de auditoría con partes dinámicas
- **Traducción de métricas de rendimiento** - Métricas de CPU y memoria, mensajes de registro regulares
- **Traducción de mensajes del sistema** - Inicialización de la aplicación, inicialización del registro frontend, mensaje de bienvenida
- **Traducción de mensajes de múltiples partes** - Traducción de partes de datos de mensajes de la consola (fecha, marca de tiempo, archivo, información de estado)
- **Soporte para 13 idiomas** - Todos los mensajes de la consola traducidos al inglés, húngaro, alemán, español, italiano, polaco, portugués, ruso, ucraniano, checo, eslovaco y chino

### ⚡ Registro de Métricas de Rendimiento
- **Clase Performance Timer** - Temporización manual para operaciones
- **Medición de tiempo de carga** - Se registran todos los tiempos de carga de módulos (Settings, Printers, Filaments, Offers, Customers)
- **Medición de tiempo de operación** - Temporización automática para operaciones asíncronas y síncronas
- **Monitoreo de uso de memoria** - Seguimiento y registro de memoria heap de JavaScript
- **Monitoreo de uso de CPU** - Medición regular del uso de CPU cada 5 minutos
- **Resumen de rendimiento** - Estadísticas agregadas para tiempos de carga y operación
- **Mensajes de registro estructurados** - Visualización detallada de porcentaje de CPU y valores de memoria
- **Comandos de rendimiento del backend** - Comando backend `get_performance_metrics` para datos de CPU y memoria

### 🔐 Implementación de Registro de Auditoría
- **Infraestructura de registro de auditoría** - Archivo de registro de auditoría separado (`audit-YYYY-MM-DD.json`)
- **Registro de operaciones críticas**:
  - Operaciones CRUD (Crear/Actualizar/Eliminar para Filaments, Printers, Offers, Customers)
  - Cambios de configuración (tema, idioma, configuración de registro, autoguardado, etc.)
  - Operaciones de respaldo (crear, restaurar)
  - Operaciones de Restablecimiento de Fábrica
  - Registro de errores
- **Visor de Registro de Auditoría** - Desplazamiento virtual para archivos grandes, con capacidades de filtrado, búsqueda y exportación
- **Limpieza automática** - Los archivos antiguos de registro de auditoría se eliminan automáticamente según días de retención configurables
- **Comandos del backend** - `write_audit_log`, `list_audit_logs`, `read_audit_log_file`, `delete_old_audit_logs`
- **Localización completa** - Los 13 idiomas soportados

### 🎯 Mejoras de UI/UX
- **Historial de Registro de Auditoría** - Diseño de dos columnas en la sección Configuración → Gestión de Registros
- **Visualización de métricas de rendimiento** - En el modal de Diagnóstico del Sistema
- **Actualizaciones en tiempo real del Visor de Registros** - Alternar auto-refresco, detección de cambios basada en hash
- **Refinamiento de auto-desplazamiento** - Conciencia de la posición de desplazamiento del usuario

### 🔧 Mejoras Técnicas
- **Optimización de verificación de actualizaciones de GitHub** - Al iniciar y cada 5 horas (basado en localStorage)
- **Formato de etiqueta beta** - Etiqueta separada `beta-v2.0.0` para versiones beta (no sobrescribe la versión principal)
- **Lógica del verificador de versiones** - Búsqueda de versión beta basada en el prefijo `beta-v`

---

## v1.9.0 (2025) - 🔍 Diagnóstico del Sistema & Mejoras de Rendimiento

### 🔍 Diagnóstico del Sistema
- **Herramienta integral de verificación de salud del sistema**:
  - Visualización de información del sistema (CPU, memoria, OS, GPU, disco)
  - Validación del sistema de archivos (data.json, filamentLibrary.json, update_filament.json)
  - Verificaciones de disponibilidad de módulos (Settings, Offers, Printers, Customers, Calculator, Home)
  - Verificaciones de disponibilidad de almacenamiento de datos
  - Barra de progreso con mensajes de estado detallados
  - Resumen con estados de errores/advertencias/éxito
  - Botón de volver a ejecutar
- **Movido a la sección Gestión de Registros** (ubicación más lógica)
- **Localización completa** en los 13 idiomas soportados

### ⚡ Rendimiento del Visor de Registros
- **Desplazamiento virtual para archivos de registro grandes**:
  - Implementación personalizada de desplazamiento virtual para el componente LogViewer
  - Solo se renderizan las entradas de registro visibles, mejorando significativamente el rendimiento
  - Desplazamiento y búsqueda suaves incluso con archivos de registro enormes (100k+ líneas)
  - Mantiene la posición y altura exacta de la barra de desplazamiento
  - Operaciones de búsqueda y filtrado significativamente más rápidas

### 🔔 Sistema de Notificaciones Unificado
- **Servicio central de notificaciones**:
  - Un solo `notificationService` para notificaciones Toast y de plataforma
  - Enrutamiento de notificaciones basado en prioridad (alta prioridad → notificación de plataforma)
  - Toma de decisiones automática basada en el estado de la aplicación (primer plano/fondo)
  - Compatible con las funciones de notificación existentes
  - Configuración de notificaciones configurable (Toast activado/desactivado, notificación de plataforma activada/desactivada, niveles de prioridad)

### 🎯 Mejoras de UI/UX
- Diagnóstico del Sistema movido de la sección de Respaldo a la sección de Gestión de Registros (ubicación más lógica)
- Errores del linter de TypeScript corregidos (variables no utilizadas, discrepancias de tipo)
- Calidad del código y mantenibilidad mejoradas

---

## v1.8.0 (2025) - 📊 Sistema Avanzado de Registro & Mejoras de Restablecimiento de Fábrica

### 🔄 Modal de Progreso de Restablecimiento de Fábrica
- **Indicador de progreso visual para restablecimiento de fábrica**:
  - Progreso animado de 4 pasos (eliminación de respaldo, eliminación de registro, eliminación de configuración, finalización)
  - Actualizaciones de estado en tiempo real con mensajes de éxito/error
  - Cuenta regresiva de 10 segundos antes de mostrar el selector de idioma
  - El modal no se puede cerrar durante el proceso de restablecimiento
  - Localización completa en los 13 idiomas soportados

### 📋 Revisión Completa del Sistema de Registro
- **Infraestructura de registro profesional**:
  - Rutas de archivos de registro multiplataforma (directorios de datos específicos de plataforma)
  - Registro de información del sistema (CPU, memoria, OS, GPU, disco, versión de la aplicación)
  - Registro de información de directorios (carpetas de registro y respaldo, cantidad de archivos, tamaños)
  - Registro detallado del estado de carga (éxito/advertencia/error/crítico)
  - Niveles de registro (DEBUG, INFO, WARN, ERROR) con filtrado
  - Soporte de formato de registro estructurado (texto y JSON)
  - Rotación de registro con limpieza automática (días de retención configurables)
  - Modal del Visor de Registros con filtrado, búsqueda, resaltado y exportación
  - Configuración de registro en Configuración (formato, nivel, días de retención)
  - Contenido del archivo de registro preservado al reiniciar la aplicación (modo anexar)

### 🔍 Diagnóstico del Sistema
- **Modal de verificación de salud del sistema**:
  - Visualización y validación de información del sistema
  - Monitoreo de uso de memoria con advertencias
  - Verificaciones de existencia de archivos
  - Verificaciones de disponibilidad de módulos
  - Pruebas de disponibilidad de almacenamiento de datos
  - Visualización de barra de progreso y resumen
  - Localización completa en los 13 idiomas soportados

### 🛠️ Mejoras Técnicas
- Registro deshabilitado durante el Restablecimiento de Fábrica para evitar contaminación del registro
- Creación de data.json retrasada hasta la selección de idioma (proceso de Restablecimiento de Fábrica más limpio)
- Inicialización del archivo de registro retrasada hasta la selección de idioma
- Reinicio automático de la aplicación después de la selección de idioma
- Comandos del backend para gestión de archivos de respaldo y registro
- Manejo de rutas multiplataforma para respaldos y registros
- Cálculo de memoria corregido (compatibilidad con sysinfo 0.31)
- Advertencias de estilo de React corregidas (conflictos de abreviación CSS)

---

## v1.7.0 (2025) - 💾 Sistema de respaldo, pantalla de carga y mejoras de biblioteca de filamentos

### 💾 Implementación Completa del Sistema de Respaldo
- **Sistema automático de respaldo** - Un archivo de respaldo por día (solo se crea en un día nuevo)
- **Hook de recordatorio de respaldo y componente UI** - Notificación si no existe un respaldo
- **UI de Historial de Respaldo en Configuración** - Lista codificada por colores (verde/amarillo/rojo/gris) para la antigüedad del archivo de respaldo y cuenta regresiva de eliminación
- **Ventana modal de autoguardado** - Explicación cuando el autoguardado está habilitado
- **Sincronización de autoguardado y respaldo automático** - Respaldo automático al guardar con autoguardado
- **Restablecimiento de Fábrica con eliminación automática de archivos de respaldo**
- **El historial de respaldo se actualiza automáticamente** cuando el autoguardado está habilitado

### 🔧 Optimización del Backend del Sistema de Respaldo
- **Comandos del backend agregados** para eliminar respaldos antiguos (`cleanup_old_backups_by_days`, `cleanup_old_backups_by_count`)
- **Funciones de limpieza del frontend actualizadas para usar comandos del backend**, eliminando errores de "forbidden path"
- **Todas las operaciones de archivos (crear, eliminar, listar) ahora ocurren desde el backend**, evitando problemas de permisos de Tauri

### ⚡ Optimización de Rendimiento del Sistema de Respaldo
- `hasTodayBackup()` optimizado: usa comando backend `list_backup_files`, no es necesario leer todos los archivos
- **Mecanismo de bloqueo agregado** para prevenir respaldos paralelos
- **Operación más rápida** incluso con un gran número de archivos de respaldo

### 📁 Apertura del Directorio de Respaldo e Historial de Registros
- **Botón agregado** en la sección Configuración → Historial de Respaldo para abrir la carpeta de respaldo
- **Nueva sección de historial de registros** en Configuración - listar y abrir archivos de registro
- **Eliminación automática de archivos de registro** configurable por días
- **Soporte multiplataforma** (macOS, Windows, Linux)

### 🎨 Revisión Completa de la Pantalla de Carga
- **Logo de la aplicación integrado** como fondo con efecto de glassmorfismo
- **Diseño fijo para marcas de verificación** - Desplazamiento automático, solo 3 módulos visibles a la vez
- **Efecto shimmer, animaciones de puntos pulsantes**
- **Contenedor de desplazamiento** con barra de desplazamiento oculta

### ⚙️ Mejoras del Proceso de Carga
- **Carga ralentizada** (retrasos de 800ms) - los mensajes de carga son legibles
- **Manejo de errores para todos los módulos** (bloques try-catch)
- **Archivo de registro físico** para todos los estados y errores
- **Resumen de carga** al final

### 🎨 Soporte Multilingüe de la Biblioteca de Filamentos
- **Colores de filamentos mostrados** en todos los idiomas soportados (no solo Húngaro/Alemán/Inglés)
- **Lógica de respaldo**: Inglés → Húngaro → Alemán → color/nombre sin procesar
- Componentes Settings, GlobalSearch y Filaments actualizados

### 🔄 Mejoras de Restablecimiento de Fábrica
- **Eliminación física de archivos** (`data.json`, `filamentLibrary.json`, `update_filamentLibrary.json`)
- **Restablecimiento de instancia de almacén** sin recarga
- **Visualización del selector de idioma** después del Restablecimiento de Fábrica

### 🎓 Actualización del Tutorial con Nuevas Características de v1.7.0
- Nuevos pasos: widget-interactivity, table-sorting, autosave-backup, filament-library-multilang
- Datos de demostración expandidos: 6 filamentos → 11 filamentos, 3 ofertas → 5 ofertas
- Claves de traducción agregadas para todos los idiomas

---

## v1.6.0 (2025) - 📊 Widgets interactivos & optimización de rendimiento de tablas grandes

### 🧠 Gráficos Interactivos y Vistas Modales Detalladas
- **Los gráficos principales del panel utilizan el componente unificado `InteractiveChart`** con puntos de datos clicables y vista modal detallada animada
- **El tooltip y la vista detallada están localizados**, mostrando etiquetas legibles para humanos (ingresos, costo, ganancia neta, cantidad de ofertas)
- **El período de tiempo se puede establecer directamente desde el gráfico de tendencias** (semanal / mensual / anual) usando brush, datos segmentados fluyen a Home → Dashboard

### 🧵 Desplazamiento Virtual para Listas Grandes
- **Desplazamiento virtual personalizado** para la lista de Ofertas y la tabla de Filamentos – solo se renderizan las filas visibles, asegurando un desplazamiento suave incluso con 10k+ registros
- **Configuración → Biblioteca de Filamentos** usa el mismo patrón, manteniendo la paleta completa de 12,000+ colores responsiva
- **La posición/altura de la barra de desplazamiento permanece correcta** gracias a los elementos espaciadores arriba y debajo del rango visible

### 📋 Ordenamiento y Filtrado Avanzado de Tablas
- **Ordenamiento de múltiples columnas** en las páginas de Filamentos y Ofertas (clic: ascendente/descendente, Mayús+clic: construir cadena de ordenamiento – ej., "Marca ↑, luego Precio/kg ↓")
- **Configuraciones de ordenamiento guardadas en `settings`**, por lo que el orden preferido persiste después del reinicio
- **Filamentos**: filtros a nivel de columna para marca, material/tipo y valor de color/HEX
- **Ofertas**: filtro de monto con valores min/máx y filtros de rango de fechas (desde / hasta)

---

**Última actualización**: 1 de diciembre de 2025


