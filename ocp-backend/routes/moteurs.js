const express = require("express");
const pool = require("../config/db");
const { verifierToken, reserverAdmin } = require("../middleware/auth");

const router = express.Router();

const LOCALISATIONS = [
  "Saake1",
  "Saake2",
  "M.Tekfen",
  "M.Z",
  "ME",
  "EC",
  "Installé",
  "En révision",
  "En attente révision",
  "Réforme",
];
const ETATS = [
  "en_stock",
  "en_revision",
  "en_attente_revision",
  "en_attente_reforme",
  "installe",
];

function mapRow(r) {
  return {
    matricule: r.matricule,
    puissance: r.puissance,
    numSerie: r.num_serie,
    marque: r.marque,
    forme: r.forme,
    vitesse: r.vitesse,
    diametreArbre: r.diametre_arbre,
    entraxeA: r.entraxe_a,
    entraxeB: r.entraxe_b,
    dimP: r.dim_p,
    dimM: r.dim_m,
    hauteurAxe: r.hauteur_axe,
    localisation: r.localisation,
    repereCompatible: r.repere_compatible,
    famille: r.famille,
    equipement: r.equipement,
    etat: r.etat,
    de: r.de_lieu,
    vers: r.vers_lieu,
    revisionCount: r.revision_count,
    date: r.date_ajout,
    observation: r.observation,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

async function ajouterHistorique(matricule, action, details) {
  await pool.query(
    "INSERT INTO historique (matricule, action, details) VALUES (?, ?, ?)",
    [matricule, action, details],
  );
}

// GET /api/moteurs/localisations -> liste fixe pour le select + autocomplete
router.get("/localisations", verifierToken, (req, res) => {
  res.json({ localisations: LOCALISATIONS });
});

// GET /api/moteurs
// Query params (tous optionnels, combinés en ET) :
//   etat, matricule, puissance, forme, localisation, de, vers
router.get("/", verifierToken, async (req, res) => {
  const { etat, matricule, puissance, forme, localisation, de, vers } =
    req.query;
  const conditions = [];
  const params = [];

  if (req.user.role !== "admin") {
    conditions.push("etat <> 'en_stock'");
  }

  if (etat && ETATS.includes(etat)) {
    if (etat === "en_stock" && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ erreur: "Accès réservé à l'administrateur." });
    }
    conditions.push("etat = ?");
    params.push(etat);
  }

  if (matricule) {
    conditions.push("LOWER(matricule) LIKE ?");
    params.push(`%${matricule.toLowerCase()}%`);
  }
  if (puissance) {
    conditions.push("LOWER(puissance) LIKE ?");
    params.push(`%${puissance.toLowerCase()}%`);
  }
  if (forme) {
    conditions.push("LOWER(forme) LIKE ?");
    params.push(`%${forme.toLowerCase()}%`);
  }
  if (localisation) {
    conditions.push("LOWER(localisation) LIKE ?");
    params.push(`%${localisation.toLowerCase()}%`);
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
    `SELECT * FROM moteurs ${where} ORDER BY updated_at DESC`,
    params,
  );
  res.json({ moteurs: rows.map(mapRow) });
});

// GET /api/moteurs/:matricule
router.get("/:matricule", verifierToken, async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM moteurs WHERE matricule = ?", [
    req.params.matricule,
  ]);
  if (!rows[0]) return res.status(404).json({ erreur: "Moteur introuvable." });
  if (rows[0].etat === "en_stock" && req.user.role !== "admin") {
    return res
      .status(403)
      .json({ erreur: "Accès réservé à l'administrateur." });
  }
  res.json({ moteur: mapRow(rows[0]) });
});

// POST /api/moteurs  (admin uniquement)
router.post("/", verifierToken, reserverAdmin, async (req, res) => {
  const b = req.body;
  if (!b.matricule)
    return res.status(400).json({ erreur: "Le matricule est obligatoire." });

  const [existe] = await pool.query(
    "SELECT matricule FROM moteurs WHERE matricule = ?",
    [b.matricule],
  );
  if (existe.length) {
    return res.status(409).json({ erreur: "Ce matricule existe déjà." });
  }

  const etat = ETATS.includes(b.etat) ? b.etat : "en_stock";

  await pool.query(
    `INSERT INTO moteurs
      (matricule, puissance, num_serie, marque, forme, vitesse, diametre_arbre,
       entraxe_a, entraxe_b, dim_p, dim_m, hauteur_axe, localisation,
       repere_compatible, famille, equipement, etat, de_lieu, vers_lieu,
       revision_count, date_ajout, observation)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,?,?)`,
    [
      b.matricule,
      b.puissance || null,
      b.numSerie || null,
      b.marque || null,
      b.forme || null,
      b.vitesse || null,
      b.diametreArbre || null,
      b.entraxeA || null,
      b.entraxeB || null,
      b.dimP || null,
      b.dimM || null,
      b.hauteurAxe || null,
      b.localisation || null,
      b.repereCompatible || null,
      b.famille || null,
      b.equipement || null,
      etat,
      b.de || null,
      b.vers || null,
      b.date || new Date().toISOString().slice(0, 10),
      b.observation || null,
    ],
  );

  await ajouterHistorique(
    b.matricule,
    "ajout",
    `Moteur ajouté (${b.forme || "—"}, ${b.puissance || "—"} kW) — état initial : ${etat}.`,
  );

  res.status(201).json({ ok: true });
});

// PUT /api/moteurs/:matricule  (admin uniquement)
router.put("/:matricule", verifierToken, reserverAdmin, async (req, res) => {
  const matricule = req.params.matricule;
  const b = req.body;

  const [rows] = await pool.query("SELECT * FROM moteurs WHERE matricule = ?", [
    matricule,
  ]);
  const existant = rows[0];
  if (!existant) return res.status(404).json({ erreur: "Moteur introuvable." });

  const nouvelEtat = ETATS.includes(b.etat) ? b.etat : existant.etat;
  let revisionCount = existant.revision_count;
  if (existant.etat !== "en_revision" && nouvelEtat === "en_revision") {
    revisionCount += 1;
  }

  await pool.query(
    `UPDATE moteurs SET
      puissance=?, num_serie=?, marque=?, forme=?, vitesse=?, diametre_arbre=?,
      entraxe_a=?, entraxe_b=?, dim_p=?, dim_m=?, hauteur_axe=?, localisation=?,
      repere_compatible=?, famille=?, equipement=?, etat=?, de_lieu=?, vers_lieu=?,
      revision_count=?, date_ajout=?, observation=?
     WHERE matricule=?`,
    [
      b.puissance || null,
      b.numSerie || null,
      b.marque || null,
      b.forme || null,
      b.vitesse || null,
      b.diametreArbre || null,
      b.entraxeA || null,
      b.entraxeB || null,
      b.dimP || null,
      b.dimM || null,
      b.hauteurAxe || null,
      b.localisation || null,
      b.repereCompatible || null,
      b.famille || null,
      b.equipement || null,
      nouvelEtat,
      b.de || null,
      b.vers || null,
      revisionCount,
      b.date || existant.date_ajout,
      b.observation || null,
      matricule,
    ],
  );

  const changements = [];
  if (existant.etat !== nouvelEtat)
    changements.push(`état : ${existant.etat} → ${nouvelEtat}`);
  if (
    (b.de || b.vers) &&
    (existant.de_lieu !== b.de || existant.vers_lieu !== b.vers)
  ) {
    changements.push(`mouvement : ${b.de || "—"} → ${b.vers || "—"}`);
  }
  await ajouterHistorique(
    matricule,
    changements.some((c) => c.startsWith("mouvement")) &&
      changements.length === 1
      ? "mouvement"
      : "modification",
    changements.length ? changements.join(" · ") : "Fiche modifiée.",
  );

  res.json({ ok: true });
});

// DELETE /api/moteurs/:matricule  (admin uniquement) -> archivé dans historique
router.delete("/:matricule", verifierToken, reserverAdmin, async (req, res) => {
  const matricule = req.params.matricule;
  const [rows] = await pool.query("SELECT * FROM moteurs WHERE matricule = ?", [
    matricule,
  ]);
  const existant = rows[0];
  if (!existant) return res.status(404).json({ erreur: "Moteur introuvable." });

  await ajouterHistorique(
    matricule,
    "suppression",
    `Moteur supprimé (dernier état : ${existant.etat}).`,
  );
  await pool.query("DELETE FROM moteurs WHERE matricule = ?", [matricule]);

  res.json({ ok: true });
});

module.exports = router;