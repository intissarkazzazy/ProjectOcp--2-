// Usage : node scripts/executer-schema.js
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

async function main() {
  const sql = fs.readFileSync(path.join(__dirname, "..", "schema.sql"), "utf8");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
    multipleStatements: true,
  });

  console.log("Connexion OK, exécution du schema...");
  await connection.query(sql);
  console.log("Schema exécuté avec succès !");
  await connection.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Erreur :", err.message);
  process.exit(1);
});
