import { useState } from "react";
import { api, setToken } from "../api.js";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur("");
    setChargement(true);
    try {
      const { token, user } = await api.login(email, password);
      setToken(token);
      onLogin(user);
    } catch (err) {
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">
          <img src="/logo-ocp.jpg" alt="OCP" className="ocp-mark-img" />
          <div>
            <div className="brand-name">Gestion des Moteurs</div>
            <div className="brand-sub">Suivi de stock &amp; parc moteurs</div>
          </div>
        </div>
        <h1>Connexion</h1>
        <p className="lede">Connectez-vous avec votre email et votre mot de passe personnel.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus autoComplete="username" />
          </div>
          <div className="form-field" style={{ marginTop: 10 }}>
            <label>Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          {erreur && <div className="login-error">{erreur}</div>}
          <button className="btn btn-primary" type="submit" style={{ width: "100%", marginTop: 16, justifyContent: "center" }} disabled={chargement}>
            {chargement ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
