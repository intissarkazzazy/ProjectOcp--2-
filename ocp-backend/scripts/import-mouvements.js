// Usage : node scripts/import-mouvements.js chemin/vers/fichier.xlsx "Mouvement"

require("dotenv").config();
const path = require("path");
const XLSX = require("xlsx");
const pool = require("../config/db");

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
function dateExcel(v) {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const s = String(v).trim();
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) {
    let [, j, mo, a] = m;
    if (a.length === 2) a = "20" + a;
    return `${a}-${mo.padStart(2, "0")}-${j.padStart(2, "0")}`;
  }
  return null;
}
function nombre(v) {
  const n = parseInt(String(v).replace(/[^\d-]/g, ""), 10);
  return isNaN(n) ? null : n;
}

async function main() {
  const fichier = process.argv[2];
  const nomFeuille = process.argv[3] || "Mouvement";
  if (!fichier) {
    console.log(
      'Usage : node scripts/import-mouvements.js chemin/vers/fichier.xlsx "Mouvement"',
    );
    process.exit(1);
  }

  const workbook = XLSX.readFile(path.resolve(fichier));
  if (!workbook.SheetNames.includes(nomFeuille)) {
    console.log(
      `Feuille "${nomFeuille}" introuvable. Feuilles disponibles : ${workbook.SheetNames.join(", ")}`,
    );
    process.exit(1);
  }

  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[nomFeuille], {
    defval: "",
  });
  let inserts = 0,
    ignores = 0;

  for (const r of rows) {
    const matricule = val(r, "Matricule", "matricule");
    if (!matricule) {
      ignores++;
      continue;
    }

    const data = {
      date: dateExcel(val(r, "Date", "date")),
      marque: val(r, "Marque N°série", "Marque N°Série", "Marque"),
      puissance: val(r, "Puissance (kw)", "Puissance (Kw)", "Puissance"),
      forme: val(r, "forme", "Forme"),
      etat: val(r, "Etat", "État"),
      compteurRevision: nombre(
        val(r, "Compteur Revision", "Compteur Révision"),
      ),
      destination: val(r, "Destination"),
      localisation: val(r, "Localisation"),
      famille: val(r, "Par Famille", "Famille"),
      entite: val(r, "Entite", "Entité"),
      equipements: val(r, "Equipements", "Équipements"),
      de: val(r, "De"),
      vers: val(r, "Vers"),
      di: val(r, "DI"),
      ot: val(r, "OT"),
      avis: val(r, "Avis"),
    };

    try {
      await pool.query(
        `INSERT INTO mouvements
          (matricule, date, marque, puissance, forme, etat, compteur_revision,
           destination, localisation, famille, entite, equipements, de_lieu, vers_lieu, di, ot, avis)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          matricule,
          data.date,
          data.marque,
          data.puissance,
          data.forme,
          data.etat,
          data.compteurRevision,
          data.destination,
          data.localisation,
          data.famille,
          data.entite,
          data.equipements,
          data.de,
          data.vers,
          data.di,
          data.ot,
          data.avis,
        ],
      );
      inserts++;
    } catch (err) {
      console.error(`Ligne ${matricule} ignorée :`, err.message);
      ignores++;
    }
  }

  console.log(
    `Import terminé : ${inserts} mouvement(s) importé(s), ${ignores} ignoré(s).`,
  );
  process.exit(0);
}

main();
