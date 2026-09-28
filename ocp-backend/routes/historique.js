const express = require("express");
const pool = require("../config/db");
const { verifierToken } = require("../middleware/auth");

const router = express.Router();

// GET /api/historique?matricule=  -> les 300 derniers événements
router.get("/", verifierToken, async (req, res) => {
  const { matricule } = req.query;
  const conditions = [];
  const params = [];
  if (matricule) {
    conditions.push("LOWER(matricule) LIKE ?");
    params.push(`%${matricule.toLowerCase()}%`);
  }
  const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";
  const [rows] = await pool.query(
    `SELECT * FROM historique ${where} ORDER BY date DESC LIMIT 300`,
    params
  );
  res.json({ historique: rows });
});

module.exports = router;
