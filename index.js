require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const upload = multer({
  dest: 'uploads/',
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ------------------ INVENTARIO ------------------ //

// POST - Registrar artículo
app.post('/api/inventario', async (req, res) => {
  const {
    nombre, proveedor, cantidad, precio, fecha,
    vidautil, ubicacion, estado, familia,
    codigobarras
  } = req.body;

  console.log('POST /api/inventario - Datos recibidos:', req.body);

  // Validación básica
  if (!nombre || !proveedor || !cantidad || !precio || !fecha || !vidautil || !ubicacion || !estado) {
    console.error('Error: Faltan campos obligatorios');
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const query = `
      INSERT INTO inventario (
        nombre, proveedor, cantidad, precio, fecha,
        vidautil, ubicacion, estado, familia,
        codigobarras
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *;
    `;

    const values = [
      nombre, proveedor, cantidad, precio, fecha,
      vidautil, ubicacion, estado, familia || null,
      codigobarras || null
    ];

    const result = await pool.query(query, values);

    console.log('Artículo guardado:', result.rows[0]);

    res.status(201).json({ message: 'Artículo guardado correctamente', item: result.rows[0] });
  } catch (error) {
    console.error('Error al guardar artículo:', error);
    res.status(500).json({ error: 'Error al guardar artículo', detalle: error.message });
  }
});

// GET - Listar artículos
app.get('/api/inventario', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventario ORDER BY fecha DESC');
    if (!Array.isArray(result.rows)) {
      console.error('Error: result.rows no es un array:', result.rows);
      return res.status(500).json({ error: 'Error interno: formato de datos inesperado' });
    }
    res.json(result.rows);
  } catch (error) {
  console.error("ERROR REAL BD:");
  console.error(error);
  res.status(500).json({
    error: error.message,
    detail: error.detail
  });
}

// PUT - Editar artículo
app.put('/api/inventario/:id', async (req, res) => {
  const { id } = req.params;
  const {
    nombre, proveedor, cantidad, precio, fecha,
    vidautil, ubicacion, estado, familia,
    codigobarras
  } = req.body;

  console.log(`PUT /api/inventario/${id} - Datos recibidos:`, req.body);

  try {
    const query = `
      UPDATE inventario SET
        nombre=$1, proveedor=$2, cantidad=$3, precio=$4, fecha=$5,
        vidautil=$6, ubicacion=$7, estado=$8, familia=$9, codigobarras=$10
      WHERE id=$11
      RETURNING *;
    `;

    const values = [
      nombre, proveedor, cantidad, precio, fecha,
      vidautil, ubicacion, estado, familia || null,
      codigobarras || null, id
    ];

    const result = await pool.query(query, values);
    console.log('Artículo actualizado:', result.rows[0]);

    res.json({ message: "Artículo actualizado correctamente", item: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar artículo:', error);
    res.status(500).json({ error: 'Error al actualizar artículo', detalle: error.message });
  }
});

// DELETE - Eliminar artículo
app.delete("/api/inventario/:id", async (req, res) => {
  const id = req.params.id;
  console.log(`DELETE /api/inventario/${id}`);
  try {
    await pool.query("DELETE FROM inventario WHERE id = $1", [id]);
    res.status(200).json({ message: 'Artículo eliminado correctamente' });
  } catch (err) {
    console.error("Error al eliminar artículo:", err);
    res.status(500).json({ error: 'Error al eliminar artículo', detalle: err.message });
  }
});

// ------------------ MANTENIMIENTO ------------------ //

// GET - Listar mantenimientos
app.get('/api/mantenimiento', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mantenimiento ORDER BY fecha DESC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener mantenimientos:', error);
    res.status(500).json({ error: 'Error al obtener mantenimientos', detalle: error.message });
  }
});

// POST - Guardar mantenimiento con foto
app.post('/api/mantenimiento', upload.single('fotoman'), async (req, res) => {
  try {
    let {
      maquina, linea, fecha, tecnico, tiempo,
      sintomas, estadomotor, transmision, hidraulico,
      neumatico, electrico, observaciones, estadoaccion
    } = req.body;

    console.log('POST /api/mantenimiento - Datos recibidos:', req.body);

    const fotoman = req.file ? `/uploads/${req.file.filename}` : null;

    // Transformar síntomas en array de PostgreSQL
    if (Array.isArray(sintomas) && sintomas.length > 0) {
      sintomas = `{${sintomas.map(s => `"${s}"`).join(',')}}`;
    } else {
      sintomas = '{}';
    }

    const query = `
      INSERT INTO mantenimiento (
        maquina, linea, fecha, tecnico, tiempo, sintomas,
        estadomotor, transmision, hidraulico,
        neumatico, electrico, observaciones,
        estadoaccion, fotoman
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9,
        $10, $11, $12,
        $13, $14
      ) RETURNING *;
    `;

    const values = [
      maquina, linea, fecha, tecnico, tiempo, sintomas,
      estadomotor, transmision, hidraulico,
      neumatico, electrico, observaciones,
      estadoaccion, fotoman
    ];

    const result = await pool.query(query, values);

    console.log('Mantenimiento guardado:', result.rows[0]);
    res.status(201).json({ message: 'Mantenimiento guardado correctamente', item: result.rows[0] });
  } catch (error) {
    console.error('Error al guardar mantenimiento:', error);
    res.status(500).json({ error: 'Error al guardar mantenimiento', detalle: error.message });
  }
});

// PUT - Editar mantenimiento con foto
app.put('/api/mantenimiento/:id', upload.single('fotoman'), async (req, res) => {
  const { id } = req.params;
  let {
    maquina, linea, fecha, tecnico, tiempo,
    sintomas, estadomotor, transmision, hidraulico,
    neumatico, electrico, observaciones, estadoaccion
  } = req.body;

  console.log(`PUT /api/mantenimiento/${id} - Datos recibidos:`, req.body);

  try {
    const fotoman = req.file ? `/uploads/${req.file.filename}` : null;

    if (Array.isArray(sintomas) && sintomas.length > 0) {
      sintomas = `{${sintomas.map(s => `"${s}"`).join(',')}}`;
    } else {
      sintomas = '{}';
    }

    const query = `
      UPDATE mantenimiento SET
        maquina=$1, linea=$2, fecha=$3, tecnico=$4, tiempo=$5,
        sintomas=$6, estadomotor=$7, transmision=$8, hidraulico=$9,
        neumatico=$10, electrico=$11, observaciones=$12,
        estadoaccion=$13${fotoman ? `, fotoman=$14` : ''}
      WHERE id=$${fotoman ? 15 : 14}
      RETURNING *;
    `;

    const values = fotoman
      ? [maquina, linea, fecha, tecnico, tiempo, sintomas, estadomotor, transmision, hidraulico,
         neumatico, electrico, observaciones, estadoaccion, fotoman, id]
      : [maquina, linea, fecha, tecnico, tiempo, sintomas, estadomotor, transmision, hidraulico,
         neumatico, electrico, observaciones, estadoaccion, id];

    const result = await pool.query(query, values);

    console.log('Mantenimiento actualizado:', result.rows[0]);
    res.status(200).json({ message: 'Mantenimiento actualizado correctamente', item: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar mantenimiento:', error);
    res.status(500).json({ error: 'Error al actualizar mantenimiento', detalle: error.message });
  }
});

// DELETE - Eliminar mantenimiento
app.delete('/api/mantenimiento/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`DELETE /api/mantenimiento/${id}`);
  try {
    await pool.query('DELETE FROM mantenimiento WHERE id = $1', [id]);
    res.status(200).json({ message: 'Mantenimiento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar mantenimiento:', error);
    res.status(500).json({ error: 'Error al eliminar mantenimiento', detalle: error.message });
  }
});

// ------------------ FIN MANTENIMIENTO ------------------ //

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});



