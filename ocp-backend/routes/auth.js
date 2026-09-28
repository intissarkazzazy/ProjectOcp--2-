const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { verifierToken } = require("../middleware/auth");
require("dotenv").config();

const router = express.Router();

// POST /api/auth/login  { email, password }
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ erreur: "Email et mot de passe requis." });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM utilisateurs WHERE email = ? LIMIT 1",
      [email.trim().toLowerCase()]
    );
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ erreur: "Identifiants incorrects." });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ erreur: "Identifiants incorrects." });
    }

    const token = jwt.sign(
      { id: user.id, nom: user.nom, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    res.json({
      token,
      user: { id: user.id, nom: user.nom, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: "Erreur serveur pendant la connexion." });
  }
});

// GET /api/auth/me  -> vérifie le token et renvoie l'utilisateur courant
router.get("/me", verifierToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
