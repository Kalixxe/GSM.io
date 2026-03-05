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

app.get('/api/inventario', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventario ORDER BY fecha DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener inventario:', error);
    res.status(500).json({ error: 'Datos de inventario no válidos', detalle: error.message });
  }
});

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
      const nombreLimpio = req.file.originalname
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "_");
      const filename = `${Date.now()}_${nombreLimpio}`;
      const { error } = await supabase.storage.from('fotosmantenimiento').upload(filename, req.file.buffer, { contentType: req.file.mimetype });
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
    let { maquina, linea, fecha, tecnico, tiempo, sintomas, estadomotor, transmision, hidraulico, neumatico, electrico, observaciones, estadoaccion } = req.body;
    sintomas = Array.isArray(sintomas) && sintomas.length > 0
      ? `{${sintomas.map(s => `"${s}"`).join(',')}}`
      : '{}';
    let fotoman = null;
    if (req.file) {
      const nombreLimpio = req.file.originalname
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "_");
      const filename = `${Date.now()}_${nombreLimpio}`;
      const { error } = await supabase.storage.from('fotosmantenimiento').upload(filename, req.file.buffer, { contentType: req.file.mimetype });
      if (error) throw new Error('Error al subir imagen: ' + error.message);
      const { data } = supabase.storage.from('fotosmantenimiento').getPublicUrl(filename);
      fotoman = data.publicUrl;
    }
    const query = `
      UPDATE mantenimiento SET maquina=$1, linea=$2, fecha=$3, tecnico=$4, tiempo=$5, sintomas=$6,
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

// ------------------ MÁQUINAS SEGURIDAD ------------------ //

app.get('/api/maquinas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM maquinas ORDER BY nombre ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener máquinas', detalle: error.message });
  }
});

app.post('/api/maquinas', async (req, res) => {
  try {
    const { nombre, linea, descripcion, advertencias } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
    const result = await pool.query(
      `INSERT INTO maquinas (nombre, linea, descripcion, advertencias) VALUES ($1,$2,$3,$4) RETURNING *;`,
      [nombre, linea || null, descripcion || null, advertencias || null]
    );
    res.status(201).json({ message: 'Máquina registrada correctamente', item: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar máquina', detalle: error.message });
  }
});

app.put('/api/maquinas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, linea, descripcion, advertencias } = req.body;
    const result = await pool.query(
      `UPDATE maquinas SET nombre=$1, linea=$2, descripcion=$3, advertencias=$4 WHERE id=$5 RETURNING *;`,
      [nombre, linea || null, descripcion || null, advertencias || null, id]
    );
    res.json({ message: 'Máquina actualizada correctamente', item: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar máquina', detalle: error.message });
  }
});

app.delete('/api/maquinas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM maquinas WHERE id=$1', [id]);
    res.json({ message: 'Máquina eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar máquina', detalle: error.message });
  }
});

// ------------------ DOCUMENTOS SEGURIDAD ------------------ //

app.get('/api/maquinas/:id/documentos', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM documentos_seguridad WHERE maquina_id=$1 ORDER BY created_at DESC', [id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener documentos', detalle: error.message });
  }
});

app.post('/api/maquinas/:id/documentos', upload.single('documento'), async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, tipo } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No se recibió ningún archivo' });
    const nombreLimpio = req.file.originalname
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${Date.now()}_${nombreLimpio}`;
    const { error } = await supabase.storage.from('documentos-seguridad').upload(filename, req.file.buffer, { contentType: 'application/pdf' });
    if (error) throw new Error('Error al subir PDF: ' + error.message);
    const { data } = supabase.storage.from('documentos-seguridad').getPublicUrl(filename);
    const result = await pool.query(
      `INSERT INTO documentos_seguridad (maquina_id, titulo, tipo, url) VALUES ($1,$2,$3,$4) RETURNING *;`,
      [id, titulo, tipo || 'analisis_riesgo', data.publicUrl]
    );
    res.status(201).json({ message: 'Documento subido correctamente', item: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al subir documento', detalle: error.message });
  }
});

app.delete('/api/documentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM documentos_seguridad WHERE id=$1', [id]);
    res.json({ message: 'Documento eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar documento', detalle: error.message });
  }
});

// ------------------ HOJAS DE MANTENIMIENTO ------------------ //

app.get('/api/hojas_mantenimiento', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hojas_mantenimiento ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener hojas', detalle: error.message });
  }
});

app.get('/api/hojas_mantenimiento/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM hojas_mantenimiento WHERE id=$1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Hoja no encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener hoja', detalle: error.message });
  }
});

app.post('/api/hojas_mantenimiento', async (req, res) => {
  try {
    const {
      maquina, nombre_maquina, modelo, fabricante, area, ubicacion, responsable,
      frecuencia, mes_anio, tipo_mantenimiento, fecha_ejecucion,
      hora_inicio, hora_fin, tecnico, verificacion, trabajos_realizados,
      repuestos, observaciones, apta_operacion, firma_tecnico, firma_supervisor,
      fecha_firma, piezasRequeridas
    } = req.body;

    if (!fecha_ejecucion || !tecnico) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: fecha y técnico' });
    }

    const result = await pool.query(
      `INSERT INTO hojas_mantenimiento (
        maquina, nombre_maquina, modelo, fabricante, area, ubicacion, responsable,
        frecuencia, mes_anio, tipo_mantenimiento, fecha_ejecucion,
        hora_inicio, hora_fin, tecnico, verificacion, trabajos_realizados,
        repuestos, observaciones, apta_operacion, firma_tecnico, firma_supervisor, fecha_firma
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
      RETURNING *;`,
      [
        maquina || null, nombre_maquina || null, modelo || null, fabricante || null,
        area || null, ubicacion || null, responsable || null,
        frecuencia || null, mes_anio || null, tipo_mantenimiento || null,
        fecha_ejecucion, hora_inicio || null, hora_fin || null, tecnico,
        verificacion || null, trabajos_realizados || null,
        repuestos || null, observaciones || null, apta_operacion || null,
        firma_tecnico || null, firma_supervisor || null, fecha_firma || null
      ]
    );

    const hojaId = result.rows[0].id;

    if (piezasRequeridas && piezasRequeridas.length > 0) {
      for (const p of piezasRequeridas) {
        await pool.query(
          `INSERT INTO ordenes_compra (hoja_id, maquina, tecnico, pieza, cantidad, item_origen)
           VALUES ($1,$2,$3,$4,$5,$6);`,
          [hojaId, nombre_maquina || maquina, tecnico, p.pieza, p.cantidad || 1, p.item]
        );
      }
    }

    res.status(201).json({
      message: 'Hoja guardada correctamente',
      item: result.rows[0],
      ordenes: piezasRequeridas ? piezasRequeridas.length : 0
    });
  } catch (error) {
    console.error('Error al guardar hoja:', error);
    res.status(500).json({ error: 'Error al guardar hoja', detalle: error.message });
  }
});

app.delete('/api/hojas_mantenimiento/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM hojas_mantenimiento WHERE id=$1', [id]);
    res.json({ message: 'Hoja eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar hoja', detalle: error.message });
  }
});

// ------------------ ÓRDENES DE COMPRA ------------------ //

app.get('/api/ordenes_compra', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ordenes_compra ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener órdenes', detalle: error.message });
  }
});

app.put('/api/ordenes_compra/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, observacion } = req.body;
    const result = await pool.query(
      `UPDATE ordenes_compra SET estado=$1, observacion=$2 WHERE id=$3 RETURNING *;`,
      [estado, observacion || null, id]
    );
    res.json({ message: 'Orden actualizada correctamente', item: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar orden', detalle: error.message });
  }
});

app.delete('/api/ordenes_compra/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM ordenes_compra WHERE id=$1', [id]);
    res.json({ message: 'Orden eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar orden', detalle: error.message });
  }
});

// ------------------ ARCHIVOS ESTÁTICOS ------------------ //
app.use(express.static(path.join(__dirname, 'public')));

// ------------------ FIN ------------------ //
app.listen(port, () => {
  console.log('Servidor corriendo en el puerto ' + port);
});
