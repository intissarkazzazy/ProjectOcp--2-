require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const moteursRoutes = require("./routes/moteurs");
const equivalentsRoutes = require("./routes/equivalents");
const pannesRoutes = require("./routes/pannes");
const historiqueRoutes = require("./routes/historique");
const mouvementsRoutes = require("./routes/mouvements");

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/moteurs", moteursRoutes);
app.use("/api/equivalents", equivalentsRoutes);
app.use("/api/pannes", pannesRoutes);
app.use("/api/historique", historiqueRoutes);
app.use("/api/mouvements", mouvementsRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ erreur: "Erreur serveur." });
});

// En local (node server.js) : on démarre un vrai serveur.
// Sur Vercel : on exporte juste "app", Vercel s'occupe du reste.
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`API OCP moteurs démarrée sur http://localhost:${PORT}`);
  });
}

module.exports = app;
