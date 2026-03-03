require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

const upload = multer({ storage: multer.memoryStorage() });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

process.on('uncaughtException', (err) => { console.error('Excepción no atrapada:', err); });
process.on('unhandledRejection', (err) => { console.error('Rechazo no manejado:', err); });

// ------------------ INVENTARIO ------------------ //

app.post('/api/inventario', async (req, res) => {
  try {
    const { nombre, proveedor, cantidad, precio, fecha, vidautil, ubicacion, estado, familia, codigobarras } = req.body;
    if (!nombre || !proveedor || !cantidad || !precio || !fecha || !vidautil || !ubicacion || !estado) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    const result = await pool.query(
      `INSERT INTO inventario (nombre, proveedor, cantidad, precio, fecha, vidautil, ubicacion, estado, familia, codigobarras)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *;`,
      [nombre, proveedor, cantidad, precio, fecha, vidautil, ubicacion, estado, familia || null, codigobarras || null]
    );
    res.status(201).json({ message: 'Artículo guardado correctamente', item: result.rows[0] });
  } catch (error) {
    console.error('Error al guardar artículo:', error);
    res.status(500).json({ error: 'Error al guardar artículo', detalle: error.message });
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
    const result = await pool.query(
      `UPDATE inventario SET nombre=$1, proveedor=$2, cantidad=$3, precio=$4, fecha=$5,
       vidautil=$6, ubicacion=$7, estado=$8, familia=$9, codigobarras=$10
       WHERE id=$11 RETURNING *;`,
      [nombre, proveedor, cantidad, precio, fecha, vidautil, ubicacion, estado, familia || null, codigobarras || null, id]
    );
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

    let fotoman = null;
    if (req.file) {
      const filename = `${Date.now()}_${req.file.originalname}`;
      const { error } = await supabase.storage
        .from('fotosmantenimiento')
        .upload(filename, req.file.buffer, { contentType: req.file.mimetype });
      if (error) throw new Error('Error al subir imagen: ' + error.message);
      const { data } = supabase.storage.from('fotosmantenimiento').getPublicUrl(filename);
      fotoman = data.publicUrl;
    }

    const result = await pool.query(
      `INSERT INTO mantenimiento (maquina, linea, fecha, tecnico, tiempo, sintomas, estadomotor, transmision, hidraulico, neumatico, electrico, observaciones, estadoaccion, fotoman)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *;`,
      [maquina, linea, fecha, tecnico, tiempo, sintomas, estadomotor, transmision, hidraulico, neumatico, electrico, observaciones, estadoaccion, fotoman]
    );
    res.status(201).json({ message: 'Mantenimiento guardado correctamente', item: result.rows[0] });
  } catch (error) {
    console.error('Error al guardar mantenimiento:', error);
    res.status(500).json({ error: 'Error al guardar mantenimiento', detalle: error.message });
  }
});

app.put('/api/mantenimiento/:id', upload.single('fotoman'), async (req, res) => {
  try {
    const { id } = req.params;
    let { maquina, linea, fecha, tecnico, tiempo, sintomas, estadomotor, transmision, hidraulico, neumatico, electrico, observ
