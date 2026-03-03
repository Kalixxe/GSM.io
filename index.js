require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Puerto dinámico para Railway
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Multer — almacenamiento en memoria (no en disco)
const upload = multer({ storage: multer.memoryStorage() });

// Conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Conexión a Supabase Storage
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

// ---------------------------------
process.on('uncaughtException', (err) => {
  console.error('Excepción no atrapada:', err);
});
process.on('unhandledRejection', (err) => {
  console.error('Rechazo no manejado:', err);
});
// ---------------------------------

// ------------------ LOGIN ------------------ //

const users = {
  "admin": { password: "Ca2025",     role: "admin"  },
  "user1": { password: "Global26", role: "viewer" },
  "Tec1": { password: "Mat26",     role: "viewer"  }
};

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
  }
  const user = users[username];
  if (user && user.password === password) {
    res.json({ success: true, role: user.role, user: username });
  } else {
    res.status(401).json({ error: 'Credenciales incorrectas' });
  }
});

// ------------------ INVENTARIO ------------------ //

app.post('/api/inventario', async (req, res) => {
  try {
    const { nombre, proveedor, cantidad, precio, fecha, vidautil, ubicacion, estado, familia, codigobarras } = req.body;
    if (!nombre || !proveedor || !cantidad || !precio || !fecha || !vidautil || !ubicacion || !estado) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    const query = `
      INSERT INTO inventario (nombre, proveedor, cantidad, precio, fecha, vidautil, ubicacion, estado, familia, codigobarras)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *;
    `;
    const values = [nombre, proveedor, cantidad, precio, fecha, vidautil, ubicacion, estado, familia || null, codigobarras || null];
    const result = await pool.query(query, values);
    res.status(201).json({ message: 'Artículo guardado correctamente', item: result.rows[0] });
  } catch (error) {
    console.error('Error al guardar artículo:', error);
    res.status(500).json({ error: 'Error de inventario no válido', detalle: error.message });
  }
});

app.get('/api/inventario', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventario ORDER BY fecha DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener inventario:', error);
    res.status(500).json({ error: 'Datos de inventario no válidos', detalle: error.message });
  }
});

app.put('/api/inventario/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, proveedor, cantidad, precio, fecha, vidautil, ubicacion, estado, familia, codigobarras } = req.body;
    const query = `
      UPDATE inventario SET nombre=$1, proveedor=$2, cantidad=$3, precio=$4, fecha=$5, vidautil=$6, ubicacion=$7, estado=$8, familia=$9, codigobarras=$10
      WHERE id=$11 RETURNING *;
    `;
    const values = [nombre, proveedor, cantidad, precio, fecha, vidautil, ubicacion, estado, familia || null, codigobarras || null, id];
    const result = await pool.query(query, values);
    res.json({ message: 'Artículo actualizado correctamente', item: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar artículo:', error);
    res.status(500).json({ error: 'Error al actualizar artículo', detalle: error.message });
  }
});

app.delete('/api/inventario/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM inventario WHERE id=$1', [id]);
    res.json({ message: 'Artículo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar artículo:', error);
    res.status(500).json({ error: 'Error al eliminar artículo', detalle: error.message });
  }
});

// ------------------ MANTENIMIENTO ------------------ //

app.get('/api/mantenimiento', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mantenimiento ORDER BY fecha DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener mantenimiento:', error);
    res.status(500).json({ error: 'Datos de mantenimiento no válidos', detalle: error.message });
  }
});

app.post('/api/mantenimiento', upload.single('fotoman'), async (req, res) => {
  try {
    let { maquina, linea, fecha, tecnico, tiempo, sintomas, estadomotor, transmision, hidraulico, neumatico, electrico, observaciones, estadoaccion } = req.body;

    sintomas = Array.isArray(sintomas) && sintomas.length > 0
      ? `{${sintomas.map(s => `"${s}"`).join(',')}}`
      : '{}';

    // Subir foto a Supabase Storage si existe
    let fotoman = null;
    if (req.file) {
      const filename = `${Date.now()}_${req.file.originalname}`;
      const { error } = await supabase.storage
        .from('fotosmantenimiento')
        .upload(filename, req.file.buffer, { contentType: req.file.mimetype });

      if (error) throw new Error('Error al subir imagen: ' + error.message);

      const { data } = supabase.storage
        .from('fotosmantenimiento')
        .getPublicUrl(filename);

      fotoman = data.publicUrl;
    }

    const query = `
      INSERT INTO mantenimiento (maquina, linea, fecha, tecnico, tiempo, sintomas, estadomotor, transmision, hidraulico, neumatico, electrico, observaciones, estadoaccion, fotoman)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *;
    `;
    const values = [maquina, linea, fecha, tecnico, tiempo, sintomas, estadomotor, transmision, hidraulico, neumatico, electrico, observaciones, estadoaccion, fotoman];
    const result = await pool.query(query, values);
    res.status(201).json({ message: 'Mantenimiento guardado correctamente', item: result.rows[0] });
  } catch (error) {
    console.error('Error al guardar mantenimiento:', error);
    res.status(500).json({ error: 'Error al guardar mantenimiento', detalle: error.message });
  }
});

app.put('/api/mantenimiento/:id', upload.single('fotoman'), async (req, res) => {
  try {
    const { id } = req.params;
    let { maquina, linea, fecha, tecnico, tiempo, sintomas, estadomotor, transmision, hidraulico, neumatico, electrico, observaciones, estadoaccion } = req.body;

    sintomas = Array.isArray(sintomas) && sintomas.length > 0
      ? `{${sintomas.map(s => `"${s}"`).join(',')}}`
      : '{}';

    // Subir nueva foto a Supabase Storage si se proporcionó
    let fotoman = null;
    if (req.file) {
      const filename = `${Date.now()}_${req.file.originalname}`;
      const { error } = await supabase.storage
        .from('fotosmantenimiento')
        .upload(filename, req.file.buffer, { contentType: req.file.mimetype });

      if (error) throw new Error('Error al subir imagen: ' + error.message);

      const { data } = supabase.storage
        .from('fotosmantenimiento')
        .getPublicUrl(filename);

      fotoman = data.publicUrl;
    }

    const query = `
      UPDATE mantenimiento SET
        maquina=$1, linea=$2, fecha=$3, tecnico=$4, tiempo=$5, sintomas=$6,
        estadomotor=$7, transmision=$8, hidraulico=$9, neumatico=$10,
        electrico=$11, observaciones=$12, estadoaccion=$13
        ${fotoman ? ', fotoman=$14' : ''}
      WHERE id=$${fotoman ? 15 : 14} RETURNING *;
    `;
    const values = fotoman
      ? [maquina, linea, fecha, tecnico, tiempo, sintomas, estadomotor, transmision, hidraulico, neumatico, electrico, observaciones, estadoaccion, fotoman, id]
      : [maquina, linea, fecha, tecnico, tiempo, sintomas, estadomotor, transmision, hidraulico, neumatico, electrico, observaciones, estadoaccion, id];

    const result = await pool.query(query, values);
    res.json({ message: 'Mantenimiento actualizado correctamente', item: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar mantenimiento:', error);
    res.status(500).json({ error: 'Error al actualizar mantenimiento', detalle: error.message });
  }
});

app.delete('/api/mantenimiento/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM mantenimiento WHERE id=$1', [id]);
    res.json({ message: 'Mantenimiento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar mantenimiento:', error);
    res.status(500).json({ error: 'Error al eliminar mantenimiento', detalle: error.message });
  }
});

// ------------------ FIN ------------------ //
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
