# SIMio – Sistema de Gestión de Máquinas e Inventario

**Versión:** 1.1  

**Ubicación:** Berlín, Alemania

SIMio es una plataforma web diseñada para la gestión eficiente de activos, enfocándose en el seguimiento y control de máquinas e inventario. Su objetivo es optimizar la administración de recursos en entornos industriales y logísticos.

## 🚀 Características Principales

- **Gestión de Máquinas:** Registro detallado de equipos, incluyendo especificaciones técnicas y estado operativo.
- **Control de Inventario:** Seguimiento en tiempo real de existencias, entradas y salidas de productos.
- **Interfaz Intuitiva:** Diseño amigable que facilita la navegación y el acceso a funcionalidades clave.
- **Seguridad:** Autenticación de usuarios para proteger la integridad de los datos.

## 🛠️ Tecnologías Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript
- **Backend:** Node.js con Express.js
- **Base de Datos:** MongoDB
- **Despliegue:** Render.com

## 📦 Instalación y Ejecución Local

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/GeoWay/sim-io.git
   cd sim-io


---

## 🚀 Características principales

- 📋 Gestión de inventario con fotos, precios, ubicación y estado
- 🛠️ Registro de mantenimientos por máquina (fecha, técnico, tipo, estado)
- 🔍 Sistema de inspección técnica rápida con carga de fotos
- 🧾 Visualización del historial por máquina
- 🔐 Sistema de autenticación con roles (`viewer`, `tecnico`, `admin`)
- 📱 Interfaz responsive con Bootstrap
- 📦 Base de datos persistente con SQLite
- 🧠 Preparado para integración futura con lector de códigos de barras

---

## 📁 Instructivo para cargar manuales en PDF

📘 **Guía de edición:** Si necesitas agregar nuevas máquinas y vincular sus manuales PDF al visor interactivo, consulta el siguiente [tutorial paso a paso en PDF](./tutorial_edicion_maquinas_html_actualizado.pdf). Esta guía te ayudará a editar correctamente el archivo `maquinas.html`, subir manuales al repositorio y verificar que todo funcione.

# SIMio - Sistema de Gestión de Máquinas e Inventario v1.1

Aplicación web para la gestión de inventario de piezas y registro de mantenimiento de máquinas industriales.

---

## 🛠️ Stack Tecnológico

- **Frontend:** HTML, Tailwind CSS, JavaScript
- **Backend:** Node.js + Express
- **Base de datos:** PostgreSQL (Supabase)
- **Almacenamiento de imágenes:** Supabase Storage
- **Hosting:** Railway
- **Repositorio:** GitHub

---

## 📁 Estructura del Proyecto

```
raíz/
├── index.js              # Servidor Node.js principal
├── package.json          # Dependencias del proyecto
└── public/               # Archivos frontend
    ├── index.html        # Login
    ├── inventario.html   # Gestión de inventario
    ├── mantenimiento.html # Registro de mantenimientos
    ├── maquinas.html     # Diagrama de máquinas
    └── info.html         # Documentación
```

---

## ⚙️ Variables de Entorno

Las siguientes variables deben estar configuradas en **Railway → Variables**:

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Connection string de Supabase PostgreSQL (Transaction Pooler puerto 6543) |
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_SECRET_KEY` | Clave secreta de Supabase (Settings → API → Secret Key) |
| `PORT` | Puerto del servidor (Railway lo asigna automáticamente) |

### Formato de DATABASE_URL
```
postgresql://postgres.PROYECTO:CONTRASEÑA@aws-1-eu-west-3.pooler.supabase.com:6543/postgres
```
> ⚠️ Usar el **Transaction Pooler (puerto 6543)** y no el Direct Connection, ya que Railway no es compatible con IPv6.

---

## 🗄️ Base de Datos

Las tablas están alojadas en **Supabase PostgreSQL**:

- `inventario` — Registro de piezas y materiales
- `mantenimiento` — Historial de mantenimientos de máquinas

### Almacenamiento de imágenes
Las fotos de mantenimiento se guardan en **Supabase Storage** en el bucket `fotosmantenimiento` (público).

---

## 👥 Usuarios y Roles

Los usuarios están definidos en `public/index.html` en el bloque `const users`:

```js
const users = {
    "admin": { password: "...", role: "admin" },
    "user1": { password: "...", role: "viewer" }
};
```

| Rol | Permisos |
|-----|----------|
| `admin` | Ver, agregar, editar y eliminar registros |
| `viewer` | Solo visualización |

> ⚠️ Para añadir nuevos usuarios editar directamente ese bloque en `index.html`.

---

## 📝 Historial de Cambios

### Marzo 2026 — Correcciones críticas

**Problema 1 — Error de conexión a base de datos (ERR_INVALID_URL)**
- La contraseña de Supabase contenía caracteres especiales que rompían el parseo de la URL
- **Solución:** Se cambió a parámetros de conexión separados y posteriormente a `connectionString` con Transaction Pooler

**Problema 2 — Incompatibilidad IPv6 entre Railway y Supabase**
- Railway no soporta IPv6, el Direct Connection de Supabase usa IPv6
- **Solución:** Se migró a Transaction Pooler de Supabase (puerto 6543) compatible con IPv4

**Problema 3 — URLs apuntando a servidor antiguo (Render)**
- `mantenimiento.html` tenía URLs apuntando a `sim-io.onrender.com`
- **Solución:** Se actualizaron todas las URLs a `gsmio-production-3b4c.up.railway.app`
- Se añadió constante `API_BASE` centralizada para facilitar futuros cambios de dominio

**Problema 4 — Imágenes no persistentes en Railway**
- Railway resetea el sistema de archivos en cada redeploy, borrando las imágenes subidas
- **Solución:** Se integró Supabase Storage para almacenamiento persistente de imágenes
- Las imágenes se suben directamente a Supabase y se guarda la URL pública en la BD

**Problema 5 — URL de imagen mal formada**
- La función `verFoto` en `mantenimiento.html` concatenaba la URL base de Railway con la URL de Supabase
- **Solución:** Se corrigió para usar directamente la URL completa de Supabase


### Versión 1.3 | Marzo 2026


Aplicación web para la gestión integral de inventario, mantenimiento, seguridad y documentación de máquinas industriales.

🛠️ Stack Tecnológico
CapaTecnologíaFrontendHTML, Tailwind CSS, JavaScriptBackendNode.js + ExpressBase de datosPostgreSQL (Supabase)AlmacenamientoSupabase StorageHostingRailwayRepositorioGitHub / GitHub Pages

📁 Estructura del Proyecto
raíz/
├── index.js                    # Servidor Node.js principal
├── package.json                # Dependencias del proyecto
└── public/
    ├── index.html              # Login
    ├── inventario.html         # Gestión de inventario con alertas de stock
    ├── mantenimiento.html      # Registro de mantenimientos
    ├── seguridad.html          # Documentos de seguridad por máquina
    ├── hoja_mantenimiento.html # Hojas de mantenimiento preventivo/correctivo
    ├── ordenes.html            # Órdenes de compra automáticas y manuales
    ├── maquinas.html           # Diagrama de planta con estados en tiempo real
    └── info.html               # Documentación

⚙️ Variables de Entorno (Railway)
VariableDescripciónDATABASE_URLConnection string Supabase — Transaction Pooler puerto 6543SUPABASE_URLURL del proyecto SupabaseSUPABASE_SECRET_KEYClave secreta de Supabase (Settings → API)PORTAsignado automáticamente por Railway

⚠️ Usar siempre el Transaction Pooler (puerto 6543) — Railway no es compatible con IPv6 del Direct Connection.


🗄️ Base de Datos (Supabase PostgreSQL)
TablaDescripcióninventarioPiezas y materiales con stock mínimo configurablemantenimientoHistorial de mantenimientos con fotosmaquinasMáquinas registradas en el módulo de seguridaddocumentos_seguridadPDFs de análisis de riesgo y manuales por máquinahojas_mantenimientoHojas de mantenimiento preventivo/correctivoordenes_compraÓrdenes generadas automáticamente o manualmentemanualesManuales técnicos por máquina para el diagrama de planta
Supabase Storage — Buckets
BucketContenidofotosmantenimientoFotos adjuntas a registros de mantenimientodocumentos-seguridadPDFs de seguridad subidos desde la app

👥 Usuarios y Roles
Definidos en public/index.html en el bloque const users:
jsconst users = {
    "admin":  { password: "...", role: "admin" },
    "user1":  { password: "...", role: "viewer" },
    "Tec1":   { password: "...", role: "viewer" }
};
RolPermisosadminVer, crear, editar y eliminar en todos los módulosviewerSolo lectura — no puede guardar ni modificar

Para añadir usuarios editar directamente el bloque const users en index.html.


📦 Módulos de la Aplicación
1. Inventario

Registro de piezas y materiales con proveedor, precio, ubicación y estado
Campo stock mínimo por artículo — genera alerta visual cuando el stock es bajo
Botón Crear Orden directamente desde la alerta de stock bajo
Exportar CSV e imprimir tabla
Roles: admin edita, viewer solo ve

2. Mantenimiento

Registro de intervenciones con síntomas, sistemas revisados y foto adjunta
Fotos almacenadas de forma persistente en Supabase Storage
Estado de acción vinculado al diagrama de planta en tiempo real
Filtros por máquina, línea, fecha y estado

3. Seguridad

Registro de máquinas con descripción y advertencias de uso
Subida de PDFs por máquina: análisis de riesgo, manuales, advertencias
PDFs almacenados en Supabase Storage (documentos-seguridad)
Roles: admin sube y edita, viewer visualiza

4. Hoja de Mantenimiento

Formulario inteligente — selecciona máquina y carga ítems específicos
6 máquinas configuradas con sus secciones propias:

Embaladora TK 381
Embaladora de Box TK 386
Cerradora TK 050
Glueline TK 60KGLINK
Quilting Machine HC 3500
Tapa-Tapa TK 900/2


Cuando un ítem se marca ✗ aparece campo para solicitar la pieza necesaria
Al guardar la hoja se generan órdenes de compra automáticamente
Historial de hojas con opción de ver, imprimir y eliminar
Viewer: solo lectura. Admin: puede editar y guardar

5. Órdenes de Compra

Generadas automáticamente desde hojas de mantenimiento (ítems con ✗)
Creación manual sin necesidad de hoja de mantenimiento
Estados: 🔴 Pendiente → 🟡 En proceso → 🟢 Completada
Al completar una orden se puede actualizar el stock en inventario directamente
Buscador integrado en el selector de artículos de inventario
Contadores visuales por estado en la cabecera

6. Diagrama de Máquinas

Layout interactivo de la planta con marcadores por máquina
Color de cada marcador según el último estado de mantenimiento:

🟢 Verde — En funcionamiento (Reparado)
🟡 Amarillo — Programado (Pendiente)
🟠 Naranja — En seguimiento
🔴 Rojo — Fuera de servicio / Alerta crítica


Panel de alertas con máquinas en estado crítico
Al pulsar una máquina: popup con estado, técnico, fecha y lista de manuales
Admin puede gestionar manuales por máquina ⚙️ sin tocar el código
Fallback a PDFs hardcoded si la máquina no tiene manuales en BD


🔄 Flujo Integrado
Inspección (Hoja Mant.) → Ítem ✗ → Orden de Compra automática
                                           ↓
Inventario stock bajo → Alerta → Orden de Compra manual
                                           ↓
                              Orden Completada → Actualiza stock inventario

🚀 Despliegue
Railway redespliega automáticamente al hacer push a main en GitHub.

Editar archivos en GitHub
Commit y push a la rama main
Railway detecta el cambio y redespliega automáticamente
Verificar en Railway → Deployments → Logs


📝 Historial de Cambios
v1.3 — Marzo 2026

✅ Módulo de Seguridad con gestión de documentos PDF por máquina
✅ Hoja de Mantenimiento inteligente por tipo de máquina
✅ Sistema de Órdenes de Compra automáticas y manuales
✅ Alertas de stock mínimo en inventario
✅ Actualización de stock al completar órdenes
✅ Gestión de manuales técnicos desde el diagrama de planta
✅ Diagrama de máquinas reconectado a Railway (URL Render eliminada)
✅ Carga del registro más reciente por máquina en el diagrama
✅ Corrección de nombres de archivo con caracteres especiales en Supabase Storage

v1.2 — Febrero 2026

✅ Migración de SQLite a Supabase PostgreSQL (80 registros históricos)
✅ Imágenes de mantenimiento migradas a Supabase Storage
✅ Autenticación por roles (admin / viewer)
✅ Eliminación del servicio Render — migración completa a Railway

v1.1 — Enero 2026

✅ Conexión a PostgreSQL via Transaction Pooler (IPv4)
✅ Corrección de URL de imágenes en mantenimiento
✅ Centralización de API_BASE en frontend

SIMio — Sistema de Gestión de Máquinas e Inventario

---

## 🚀 Despliegue

El proyecto se despliega automáticamente en Railway cada vez que se hace push a la rama `main` en GitHub.

1. Hacer cambios en los archivos
2. Commit y push a GitHub
3. Railway detecta el cambio y redespliega automáticamente
4. Verificar en Railway → Deployments → Logs

---

## 📞 Contacto

© 2025 **GEOWAY**, Technology-Based Initiative – IBT. All rights reserved. Berlin - Germany  
[geo-way.github.io/GeoWay.io](https://geo-way.github.io/GeoWay.io/index.html)


