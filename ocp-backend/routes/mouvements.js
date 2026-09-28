const express = require("express");
const pool = require("../config/db");
const { verifierToken, reserverAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", verifierToken, async (req, res) => {
  const { matricule, de, vers } = req.query;
  const conditions = [];
  const params = [];

  if (matricule) {
    conditions.push("LOWER(matricule) LIKE ?");
    params.push(`%${matricule.toLowerCase()}%`);
  }
  if (de) {
    conditions.push("LOWER(de_lieu) LIKE ?");
    params.push(`%${de.toLowerCase()}%`);
  }
  if (vers) {
    conditions.push("LOWER(vers_lieu) LIKE ?");
    params.push(`%${vers.toLowerCase()}%`);
  }

  const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";
  const [rows] = await pool.query(
    `SELECT * FROM mouvements ${where} ORDER BY date DESC, id DESC LIMIT 1000`,
    params,
  );
  res.json({ mouvements: rows });
});

router.post("/", verifierToken, reserverAdmin, async (req, res) => {
  const b = req.body;
  if (!b.matricule)
    return res.status(400).json({ erreur: "Le matricule est obligatoire." });

  const [result] = await pool.query(
    `INSERT INTO mouvements
      (matricule, date, marque, puissance, forme, etat, compteur_revision,
       destination, localisation, famille, entite, equipements, de_lieu, vers_lieu, di, ot, avis)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      b.matricule,
      b.date || new Date().toISOString().slice(0, 10),
      b.marque || null,
      b.puissance || null,
      b.forme || null,
      b.etat || null,
      b.compteurRevision ?? null,
      b.destination || null,
      b.localisation || null,
      b.famille || null,
      b.entite || null,
      b.equipements || null,
      b.de || null,
      b.vers || null,
      b.di || null,
      b.ot || null,
      b.avis || null,
    ],
  );
  res.status(201).json({ ok: true, id: result.insertId });
});

router.put("/:id", verifierToken, reserverAdmin, async (req, res) => {
  const b = req.body;
  const [result] = await pool.query(
    `UPDATE mouvements SET
      matricule=?, date=?, marque=?, puissance=?, forme=?, etat=?, compteur_revision=?,
      destination=?, localisation=?, famille=?, entite=?, equipements=?, de_lieu=?, vers_lieu=?, di=?, ot=?, avis=?
     WHERE id=?`,
    [
      b.matricule,
      b.date || null,
      b.marque || null,
      b.puissance || null,
      b.forme || null,
      b.etat || null,
      b.compteurRevision ?? null,
      b.destination || null,
      b.localisation || null,
      b.famille || null,
      b.entite || null,
      b.equipements || null,
      b.de || null,
      b.vers || null,
      b.di || null,
      b.ot || null,
      b.avis || null,
      req.params.id,
    ],
  );
  if (!result.affectedRows)
    return res.status(404).json({ erreur: "Mouvement introuvable." });
  res.json({ ok: true });
});

router.delete("/:id", verifierToken, reserverAdmin, async (req, res) => {
  const [result] = await pool.query("DELETE FROM mouvements WHERE id = ?", [
    req.params.id,
  ]);
  if (!result.affectedRows)
    return res.status(404).json({ erreur: "Mouvement introuvable." });
  res.json({ ok: true });
});

module.exports = router;
