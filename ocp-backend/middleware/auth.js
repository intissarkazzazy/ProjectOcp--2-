const jwt = require("jsonwebtoken");
require("dotenv").config();

// Vérifie le token JWT envoyé dans l'en-tête "Authorization: Bearer xxx"
function verifierToken(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ erreur: "Non authentifié." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, nom, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ erreur: "Session invalide ou expirée." });
  }
}

// A utiliser après verifierToken : bloque tout ce qui n'est pas admin
function reserverAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ erreur: "Accès réservé à l'administrateur." });
  }
  next();
}

module.exports = { verifierToken, reserverAdmin };
