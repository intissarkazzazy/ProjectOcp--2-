// Usage : node scripts/import-excel.js chemin/vers/fichier.xlsx
//
// Lit TOUTES les feuilles du fichier et importe chacune avec l'état
// indiqué dans SHEET_ETAT_MAP ci-dessous. Les feuilles non listées sont
// ignorées (affichées en fin d'exécution pour vérification).

require("dotenv").config();
const path = require("path");
const XLSX = require("xlsx");
const pool = require("../config/db");

// ⚠️ À REMPLIR VOUS-MÊME : nom EXACT de la feuille (onglet en bas d'Excel)
// -> état correspondant. États possibles :
//    en_stock | en_revision | en_attente_revision | en_attente_reforme | installe
// Une feuille absente de cette liste sera ignorée (pas importée).
const SHEET_ETAT_MAP = {
  Saake1: "en_stock",
  Saake2: "en_stock",
  MT: "en_stock",
  ME: "en_stock",
  Bomolec: "en_revision",
  FARATEC: "en_revision",
};

const ETATS_VALIDES = [
  "en_stock",
  "en_revision",
  "en_attente_revision",
  "en_attente_reforme",
  "installe",
];

function val(row, ...cles) {
  for (const c of cles) {
    if (
      row[c] !== undefined &&
      row[c] !== null &&
      String(row[c]).trim() !== ""
    ) {
      return String(row[c]).trim();
    }
  }
  return "";
}

async function main() {
  const fichier = process.argv[2];
  if (!fichier) {
    console.log(
      "Usage : node scripts/import-excel.js chemin/vers/fichier.xlsx",
    );
    process.exit(1);
  }

  const workbook = XLSX.readFile(path.resolve(fichier));
  let totalInserts = 0,
    totalIgnores = 0;
  const feuillesIgnorees = [];

  for (const nomFeuille of workbook.SheetNames) {
    const etat = SHEET_ETAT_MAP[nomFeuille];
    if (!etat) {
      feuillesIgnorees.push(nomFeuille);
      continue;
    }
    if (!ETATS_VALIDES.includes(etat)) {
      console.log(
        `État "${etat}" invalide pour la feuille "${nomFeuille}", ignorée.`,
      );
      feuillesIgnorees.push(nomFeuille);
      continue;
    }

    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[nomFeuille], {
      defval: "",
    });
    let inserts = 0,
      ignores = 0;

    for (const r of rows) {
      const matricule = val(r, "Mle", "matricule", "Matricule", "MATRICULE");
      if (!matricule) {
        ignores++;
        continue;
      }

      const localisation =
        val(
          r,
          "POSITION GEOGRAPHIQUE",
          "Localisation",
          "Position géographique",
        ) || nomFeuille;

      const data = {
        puissance: val(r, "P(kw)", "P (kw)", "Puissance", "PUISSANCE"),
        numSerie: val(r, "N°SERIE", "N° SERIE", "NumSerie", "N° série"),
        marque: val(r, "MARQUE", "Marque"),
        forme: val(r, "FORME", "Forme"),
        vitesse: val(r, "V tr/mn", "Vitesse", "VITESSE"),
        diametreArbre: val(r, "DIAMETRE ARBRE", "Diamètre arbre"),
        entraxeA: val(r, "ENTRAXE (A ou P)", "Entraxe A", "ENTRAXE A"),
        entraxeB: val(r, "ENTRAXE (B ou M)", "Entraxe B", "ENTRAXE B"),
        dimP: val(
          r,
          "Dimension P(B5 ou V1)",
          "Dimension P (B5 ou V1)",
          "Dimension P",
        ),
        dimM: val(r, "Dimension M (B5 ou V1)", "Dimension M"),
        hauteurAxe: val(r, "Hauteur d'axe", "HAUTEUR AXE", "Hauteur axe"),
        repereCompatible: val(r, "REPERE COMPATIBLE", "Repère compatible"),
        famille: val(r, "FAMILLE", "Famille"),
        equipement: val(r, "EQUIPEMENT", "Équipement", "Equipement"),
        de: val(r, "DE", "De"),
        vers: val(r, "VERS", "Vers"),
        observation: val(r, "OBSERVATION", "Observation"),
      };

      try {
        await pool.query(
          `INSERT INTO moteurs
            (matricule, puissance, num_serie, marque, forme, vitesse, diametre_arbre,
             entraxe_a, entraxe_b, dim_p, dim_m, hauteur_axe, localisation,
             repere_compatible, famille, equipement, de_lieu, vers_lieu, observation,
             etat, revision_count, date_ajout)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, ?, 0, CURDATE())
           ON DUPLICATE KEY UPDATE
             puissance=VALUES(puissance), num_serie=VALUES(num_serie), marque=VALUES(marque),
             forme=VALUES(forme), vitesse=VALUES(vitesse), diametre_arbre=VALUES(diametre_arbre),
             entraxe_a=VALUES(entraxe_a), entraxe_b=VALUES(entraxe_b), dim_p=VALUES(dim_p),
             dim_m=VALUES(dim_m), hauteur_axe=VALUES(hauteur_axe), localisation=VALUES(localisation),
             repere_compatible=VALUES(repere_compatible), famille=VALUES(famille),
             equipement=VALUES(equipement), de_lieu=VALUES(de_lieu), vers_lieu=VALUES(vers_lieu),
             observation=VALUES(observation), etat=VALUES(etat)`,
          [
            matricule,
            data.puissance,
            data.numSerie,
            data.marque,
            data.forme,
            data.vitesse,
            data.diametreArbre,
            data.entraxeA,
            data.entraxeB,
            data.dimP,
            data.dimM,
            data.hauteurAxe,
            localisation,
            data.repereCompatible,
            data.famille,
            data.equipement,
            data.de,
            data.vers,
            data.observation,
            etat,
          ],
        );
        inserts++;
      } catch (err) {
        console.error(
          `  [${nomFeuille}] ligne ${matricule} ignorée :`,
          err.message,
        );
        ignores++;
      }
    }
    console.log(
      `Feuille "${nomFeuille}" (${etat}) : ${inserts} traitée(s), ${ignores} ignorée(s).`,
    );
    totalInserts += inserts;
    totalIgnores += ignores;
  }

  console.log(
    `\nTotal : ${totalInserts} ligne(s) importée(s), ${totalIgnores} ignorée(s).`,
  );
  if (feuillesIgnorees.length) {
    console.log(
      `Feuilles NON importées (absentes de SHEET_ETAT_MAP) : ${feuillesIgnorees.join(", ")}`,
    );
  }
  process.exit(0);
}

main();
