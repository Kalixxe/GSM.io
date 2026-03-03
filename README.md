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


