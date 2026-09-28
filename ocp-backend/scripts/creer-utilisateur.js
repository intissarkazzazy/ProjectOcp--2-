// Usage : node scripts/creer-utilisateur.js "Nom Prenom" email@ocp.com MotDePasse <admin|visiteur>
// Exemple : node scripts/creer-utilisateur.js "Hosni" hosni@ocp.com MotDePasse123 admin

require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function main() {
  const [nom, email, password, role] = process.argv.slice(2);

  if (!nom || !email || !password || !["admin", "visiteur"].includes(role)) {
    console.log('Usage : node scripts/creer-utilisateur.js "Nom Prenom" email@ocp.com MotDePasse <admin|visiteur>');
    process.exit(1);
  }
  if (!EMAIL_RE.test(email)) {
    console.log("Email invalide.");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);
  const emailNorm = email.trim().toLowerCase();

  try {
    await pool.query(
      `INSERT INTO utilisateurs (nom, email, password_hash, role) VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE nom = VALUES(nom), password_hash = VALUES(password_hash), role = VALUES(role)`,
      [nom, emailNorm, hash, role]
    );
    console.log(`Compte "${nom}" (${emailNorm}) créé/mis à jour avec le rôle "${role}".`);
  } catch (err) {
    console.error("Erreur :", err.message);
  } finally {
    process.exit(0);
  }
}

main();
