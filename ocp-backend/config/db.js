const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "ocp_moteurs",
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

pool
  .getConnection()
  .then((conn) => {
    console.log("MySQL : connexion OK");
    conn.release();
  })
  .catch((err) => {
    console.error("MySQL : échec de connexion ->", err.message);
    console.error(
      "Vérifiez .env (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME) et que MySQL tourne.",
    );
  });

module.exports = pool;
