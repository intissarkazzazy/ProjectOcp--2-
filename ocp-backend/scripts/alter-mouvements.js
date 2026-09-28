require("dotenv").config();
const mysql = require("mysql2/promise");

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
    multipleStatements: true,
  });

  const colonnes = [
    "marque VARCHAR(100)",
    "puissance VARCHAR(20)",
    "forme VARCHAR(20)",
    "etat VARCHAR(50)",
    "compteur_revision INT",
    "destination VARCHAR(50)",
    "localisation VARCHAR(50)",
    "famille VARCHAR(50)",
    "entite VARCHAR(50)",
    "equipements VARCHAR(150)",
    "di VARCHAR(50)",
    "ot VARCHAR(50)",
    "avis VARCHAR(150)",
  ];

  for (const col of colonnes) {
    const nom = col.split(" ")[0];
    try {
      await connection.query(`ALTER TABLE mouvements ADD COLUMN ${col}`);
      console.log(`Colonne ajoutée : ${nom}`);
    } catch (err) {
      if (err.message.includes("Duplicate column")) {
        console.log(`Déjà présente : ${nom}`);
      } else {
        console.error(`Erreur pour ${nom} :`, err.message);
      }
    }
  }

  await connection.end();
  console.log("Terminé !");
  process.exit(0);
}

main().catch((err) => {
  console.error("Erreur :", err.message);
  process.exit(1);
});
