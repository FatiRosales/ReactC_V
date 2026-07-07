const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET /api/portafolios - listar todos los portafolios con su ganancia/pérdida total
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.id, p.nombre, p.fecha_creacion,
      COALESCE(SUM(CASE WHEN t.tipo = 'venta' THEN t.ganancia_perdida ELSE 0 END), 0) AS ganancia_perdida
      FROM portafolios p
      LEFT JOIN transacciones t ON t.portafolio_id = p.id
      GROUP BY p.id
      ORDER BY p.id;
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/portafolios - crear portafolio nuevo (botón "Nuevo" + campo "Nombre" + "Guardar")
router.post("/", async (req, res) => {
  const { nombre } = req.body;
  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ error: "El nombre del portafolio es obligatorio." });
  }
  try {
    const { rows } = await pool.query(
      "INSERT INTO portafolios (nombre) VALUES ($1) RETURNING *",
      [nombre.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/portafolios/:id - detalle: posiciones agregadas + compras y ventas detalladas
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const portafolio = await pool.query("SELECT * FROM portafolios WHERE id = $1", [id]);
    if (portafolio.rows.length === 0) {
      return res.status(404).json({ error: "Portafolio no encontrado." });
    }

    const posiciones = await pool.query(`
      SELECT simbolo,
        SUM(CASE WHEN tipo = 'compra' THEN cantidad ELSE -cantidad END) AS cantidad_actual,
        SUM(CASE WHEN tipo = 'venta' THEN cantidad * precio ELSE 0 END)
          - SUM(CASE WHEN tipo = 'compra' THEN cantidad * precio ELSE 0 END) AS ganancia_perdida
      FROM transacciones
      WHERE portafolio_id = $1
      GROUP BY simbolo
      ORDER BY simbolo;
    `, [id]);

    const compras = await pool.query(`
      SELECT t.id, c.nombre, t.simbolo, t.cantidad, t.precio, t.fecha
      FROM transacciones t
      LEFT JOIN catalogo c ON c.simbolo = t.simbolo
      WHERE t.portafolio_id = $1 AND t.tipo = 'compra'
      ORDER BY t.fecha DESC;
    `, [id]);

    const ventas = await pool.query(`
      SELECT t.id, c.nombre, t.simbolo, t.cantidad,
             t.precio_compra_ref AS precio_compra, t.precio AS precio_venta,
             t.ganancia_perdida, t.fecha
      FROM transacciones t
      LEFT JOIN catalogo c ON c.simbolo = t.simbolo
      WHERE t.portafolio_id = $1 AND t.tipo = 'venta'
      ORDER BY t.fecha DESC;
    `, [id]);

    res.json({
      portafolio: portafolio.rows[0],
      posiciones: posiciones.rows,
      compras: compras.rows,
      ventas: ventas.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/portafolios/:id - guardar cambios (ej. renombrar)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  try {
    const { rows } = await pool.query(
      "UPDATE portafolios SET nombre = $1 WHERE id = $2 RETURNING *",
      [nombre, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Portafolio no encontrado." });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/portafolios/:id
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM portafolios WHERE id = $1", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
