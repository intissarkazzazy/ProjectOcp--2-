const express = require("express");
const pool = require("../config/db");
const { verifierToken, reserverAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /api/pannes -> liste des pannes déclarées (visible par tous les connectés)
router.get("/", verifierToken, async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM pannes ORDER BY date DESC");
  res.json({ pannes: rows });
});

// POST /api/pannes  { matricule, ligne, description }
// Déclare la panne d'un moteur : passe le moteur en "en_revision"
// et journalise l'événement (admin uniquement).
router.post("/", verifierToken, reserverAdmin, async (req, res) => {
  const { matricule, ligne, description } = req.body;
  if (!matricule) return res.status(400).json({ erreur: "Matricule requis." });

  const [rows] = await pool.query("SELECT * FROM moteurs WHERE matricule = ?", [matricule]);
  if (!rows[0]) return res.status(404).json({ erreur: "Moteur introuvable." });

  const etaitEnRevision = rows[0].etat === "en_revision";
  await pool.query(
    "UPDATE moteurs SET etat = 'en_revision', revision_count = revision_count + ? WHERE matricule = ?",
    [etaitEnRevision ? 0 : 1, matricule]
  );

  const [result] = await pool.query(
    "INSERT INTO pannes (matricule, ligne, description) VALUES (?, ?, ?)",
    [matricule, ligne || null, description || null]
  );
  await pool.query(
    "INSERT INTO historique (matricule, action, details) VALUES (?, 'modification', ?)",
    [matricule, `Panne déclarée sur ${ligne || "—"} : ${description || "—"} (état -> en révision).`]
  );

  res.status(201).json({ ok: true, id: result.insertId });
});

// PATCH /api/pannes/:id/resoudre  { moteurRemplacant }
router.patch("/:id/resoudre", verifierToken, reserverAdmin, async (req, res) => {
  const { moteurRemplacant } = req.body;
  await pool.query(
    "UPDATE pannes SET resolue = 1, moteur_remplacant = ? WHERE id = ?",
    [moteurRemplacant || null, req.params.id]
  );
  res.json({ ok: true });
});

module.exports = router;
