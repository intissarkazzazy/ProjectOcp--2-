const express = require("express");
const pool = require("../config/db");
const { verifierToken, reserverAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /api/equivalents?forme=&puissance=&vitesse=
// Cherche, dans le STOCK, des moteurs avec les mêmes caractéristiques
// (réservé admin, car ça lit la liste "en stock").
router.get("/", verifierToken, reserverAdmin, async (req, res) => {
  const { forme, puissance, vitesse } = req.query;
  const conditions = ["etat = 'en_stock'"];
  const params = [];

  if (forme) {
    conditions.push("forme = ?");
    params.push(forme);
  }
  if (puissance) {
    conditions.push("puissance = ?");
    params.push(puissance);
  }
  if (vitesse) {
    conditions.push("vitesse = ?");
    params.push(vitesse);
  }

  const [rows] = await pool.query(
    `SELECT * FROM moteurs WHERE ${conditions.join(" AND ")} ORDER BY updated_at DESC`,
    params
  );
  res.json({ equivalents: rows });
});

// POST /api/equivalents/utiliser
// { matricule, vers }  -> retire un moteur du stock et le passe "installé"
router.post("/utiliser", verifierToken, reserverAdmin, async (req, res) => {
  const { matricule, vers } = req.body;
  if (!matricule) return res.status(400).json({ erreur: "Matricule requis." });

  const [rows] = await pool.query(
    "SELECT * FROM moteurs WHERE matricule = ? AND etat = 'en_stock'",
    [matricule]
  );
  if (!rows[0]) {
    return res.status(404).json({ erreur: "Ce moteur n'est pas disponible en stock." });
  }

  await pool.query(
    "UPDATE moteurs SET etat = 'installe', de_lieu = 'Stock', vers_lieu = ? WHERE matricule = ?",
    [vers || null, matricule]
  );
  await pool.query(
    "INSERT INTO historique (matricule, action, details) VALUES (?, 'mouvement', ?)",
    [matricule, `Sorti du stock et installé sur ${vers || "—"} (moteur équivalent).`]
  );

  res.json({ ok: true });
});

module.exports = router;
