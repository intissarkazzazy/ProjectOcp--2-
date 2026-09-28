import { useEffect, useState, useCallback } from "react";
import { api, hasToken, setToken } from "./api.js";
import { ETATS, MOUVEMENT_COLONNES } from "./constants.js";
import { exporterExcel, exporterPDF } from "./export.js";

import Login from "./components/Login.jsx";
import ListeMoteurs from "./components/ListeMoteurs.jsx";
import RechercheAvancee from "./components/RechercheAvancee.jsx";
import MvtFilter from "./components/MvtFilter.jsx";
import MouvementsListe from "./components/MouvementsListe.jsx";
import FormulaireAjout from "./components/FormulaireAjout.jsx";
import FormulaireMouvement from "./components/FormulaireMouvement.jsx";
import HistoriqueList from "./components/HistoriqueList.jsx";

const RECHERCHE_VIDE = {
  matricule: "",
  puissance: "",
  forme: "",
  localisation: "",
};
const ACTIONS_HISTORIQUE = [
  { id: "", label: "Toutes les actions" },
  { id: "ajout", label: "Ajout" },
  { id: "modification", label: "Modification" },
  { id: "mouvement", label: "Mouvement" },
  { id: "suppression", label: "Suppression" },
];

function correspond(m, filtre) {
  if (
    filtre.matricule.trim() &&
    !(m.matricule || "")
      .toLowerCase()
      .includes(filtre.matricule.trim().toLowerCase())
  )
    return false;
  if (
    filtre.puissance.trim() &&
    !(m.puissance || "")
      .toLowerCase()
      .includes(filtre.puissance.trim().toLowerCase())
  )
    return false;
  if (
    filtre.forme.trim() &&
    !(m.forme || "").toLowerCase().includes(filtre.forme.trim().toLowerCase())
  )
    return false;
  if (
    filtre.localisation.trim() &&
    !(m.localisation || "")
      .toLowerCase()
      .includes(filtre.localisation.trim().toLowerCase())
  )
    return false;
  return true;
}

// IMPORTANT : composants déclarés EN DEHORS de App() — sinon React recrée
// un nouveau type de composant à chaque rendu et les <input> perdent le
// focus à chaque frappe.

function BarreExport({ liste, selectedIds, colonnes, keyField = "matricule" }) {
  if (!liste.length) return null;
  const cible =
    selectedIds.size > 0
      ? liste.filter((m) => selectedIds.has(m[keyField]))
      : liste;
  return (
    <div className="toolbar" style={{ marginTop: -4, marginBottom: 12 }}>
      <span className="count-badge" style={{ marginLeft: 0 }}>
        {selectedIds.size > 0
          ? `${selectedIds.size} sélectionné(s)`
          : `${liste.length} élément(s) affiché(s)`}
      </span>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => exporterExcel(cible, "export", colonnes)}
      >
        Exporter Excel
      </button>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => exporterPDF(cible, "export", colonnes)}
      >
        Exporter PDF
      </button>
    </div>
  );
}

function BarreFiltreRapide({ valeurs, onChange }) {
  const actif = Object.values(valeurs).some((v) => v.trim());
  return (
    <>
      <RechercheAvancee valeurs={valeurs} onChange={onChange} />
      {actif && (
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginTop: -8, marginBottom: 12 }}
          onClick={() => onChange(RECHERCHE_VIDE)}
        >
          ✕ Effacer le filtre
        </button>
      )}
    </>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [chargementSession, setChargementSession] = useState(true);
  const [view, setView] = useState("dashboard");
  const [etatFiltre, setEtatFiltre] = useState("en_stock");

  const [moteurs, setMoteurs] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [modal, setModal] = useState(null);
  const [mvtModal, setMvtModal] = useState(null);
  const [toast, setToastState] = useState(null);

  const [recherche, setRecherche] = useState(RECHERCHE_VIDE);
  const [filtreRapide, setFiltreRapide] = useState(RECHERCHE_VIDE);
  const [mvtFiltreRapide, setMvtFiltreRapide] = useState(RECHERCHE_VIDE);

  const [mvtDe, setMvtDe] = useState("");
  const [mvtVers, setMvtVers] = useState("");
  const [mvtDeActif, setMvtDeActif] = useState("");
  const [mvtVersActif, setMvtVersActif] = useState("");
  const [histRecherche, setHistRecherche] = useState("");
  const [histAction, setHistAction] = useState("");
  const [mouvements, setMouvements] = useState([]);

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [mvtSelectedIds, setMvtSelectedIds] = useState(new Set());

  const isAdmin = user?.role === "admin";

  function showToast(msg, isErr) {
    setToastState({ msg, isErr });
    setTimeout(() => setToastState(null), 3200);
  }

  useEffect(() => {
    if (!hasToken()) {
      setChargementSession(false);
      return;
    }
    api
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => setToken(null))
      .finally(() => setChargementSession(false));
  }, []);

  const rechercheActive = Object.values(recherche).some((v) => v.trim());

  const rechargerMoteurs = useCallback(async () => {
    if (!user) return;
    try {
      const params = {};
      if (view === "stock") params.etat = "en_stock";
      if (view === "etat") params.etat = etatFiltre;
      if (view === "recherche" && rechercheActive) {
        if (recherche.matricule.trim())
          params.matricule = recherche.matricule.trim();
        if (recherche.puissance.trim())
          params.puissance = recherche.puissance.trim();
        if (recherche.forme.trim()) params.forme = recherche.forme.trim();
        if (recherche.localisation.trim())
          params.localisation = recherche.localisation.trim();
      }
      const { moteurs } = await api.listerMoteurs(params);
      setMoteurs(moteurs);
    } catch (err) {
      showToast(err.message, true);
    }
  }, [user, view, etatFiltre, recherche, rechercheActive]);

  useEffect(() => {
    rechargerMoteurs();
  }, [rechargerMoteurs]);

  useEffect(() => {
    setSelectedIds(new Set());
    setFiltreRapide(RECHERCHE_VIDE);
  }, [view, etatFiltre, mvtDeActif, mvtVersActif, recherche]);

  useEffect(() => {
    if (view === "historique" && user) {
      const t = setTimeout(() => {
        api
          .listerHistorique(histRecherche.trim() || undefined)
          .then((r) => setHistorique(r.historique))
          .catch((e) => showToast(e.message, true));
      }, 250);
      return () => clearTimeout(t);
    }
  }, [view, user, histRecherche]);

  const historiqueFiltre = histAction
    ? historique.filter((h) => h.action === histAction)
    : historique;

  const [tousLesMoteurs, setTousLesMoteurs] = useState([]);
  useEffect(() => {
    if (!user) return;
    api
      .listerMoteurs()
      .then((r) => setTousLesMoteurs(r.moteurs))
      .catch(() => {});
  }, [user, moteurs]);

  const [nbMouvements, setNbMouvements] = useState(null);
  const rechargerMouvements = useCallback(() => {
    if (!user) return;
    const params = {};
    if (mvtDeActif) params.de = mvtDeActif;
    if (mvtVersActif) params.vers = mvtVersActif;
    api
      .listerMouvements(params)
      .then((r) => {
        setMouvements(r.mouvements);
        setNbMouvements(r.mouvements.length);
      })
      .catch((e) => showToast(e.message, true));
  }, [user, mvtDeActif, mvtVersActif]);

  useEffect(() => {
    if (!user) return;
    api
      .listerMouvements()
      .then((r) => setNbMouvements(r.mouvements.length))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (view === "mvt" && user) rechargerMouvements();
  }, [view, user, rechargerMouvements]);

  useEffect(() => {
    setMvtSelectedIds(new Set());
  }, [view, mvtDeActif, mvtVersActif, mvtFiltreRapide]);

  function compter(etatId) {
    return tousLesMoteurs.filter((m) => m.etat === etatId).length;
  }

  function handleLogin(u) {
    setUser(u);
  }
  function handleLogout() {
    setToken(null);
    setUser(null);
    setView("dashboard");
  }

  async function handleSubmitForm(data) {
    try {
      if (modal.mode === "add") {
        await api.ajouterMoteur(data);
        showToast("Moteur ajouté.");
      } else {
        await api.modifierMoteur(modal.moteur.matricule, data);
        showToast("Moteur mis à jour.");
      }
      setModal(null);
      rechargerMoteurs();
    } catch (err) {
      showToast(err.message, true);
    }
  }

  async function handleDelete(matricule) {
    if (
      !confirm(
        `Supprimer le moteur ${matricule} ? Il sera conservé dans l'historique.`,
      )
    )
      return;
    try {
      await api.supprimerMoteur(matricule);
      showToast("Moteur supprimé et archivé dans l'historique.");
      rechargerMoteurs();
    } catch (err) {
      showToast(err.message, true);
    }
  }

  async function handleSubmitMouvement(data) {
    try {
      if (mvtModal.mode === "add") {
        await api.ajouterMouvement(data);
        showToast("Mouvement ajouté.");
      } else {
        await api.modifierMouvement(mvtModal.mouvement.id, data);
        showToast("Mouvement mis à jour.");
      }
      setMvtModal(null);
      rechargerMouvements();
    } catch (err) {
      showToast(err.message, true);
    }
  }

  async function handleDeleteMouvement(id) {
    if (!confirm("Supprimer ce mouvement ?")) return;
    try {
      await api.supprimerMouvement(id);
      showToast("Mouvement supprimé.");
      rechargerMouvements();
    } catch (err) {
      showToast(err.message, true);
    }
  }

  function toggleSelect(matricule) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(matricule)) next.delete(matricule);
      else next.add(matricule);
      return next;
    });
  }
  function toggleSelectAll(liste) {
    setSelectedIds((prev) => {
      const touteSelectionnee =
        liste.length > 0 && liste.every((m) => prev.has(m.matricule));
      if (touteSelectionnee) return new Set();
      return new Set(liste.map((m) => m.matricule));
    });
  }

  function toggleSelectMvt(id) {
    setMvtSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleSelectAllMvt(liste) {
    setMvtSelectedIds((prev) => {
      const touteSelectionnee =
        liste.length > 0 && liste.every((m) => prev.has(m.id));
      if (touteSelectionnee) return new Set();
      return new Set(liste.map((m) => m.id));
    });
  }

  if (chargementSession) return null;
  if (!user) return <Login onLogin={handleLogin} />;

  const tabs = [
    { id: "dashboard", label: "Tableau de bord" },
    ...(isAdmin ? [{ id: "stock", label: "Stock" }] : []),
    { id: "recherche", label: "Recherche" },
    { id: "mvt", label: "Mouvements" },
    { id: "historique", label: "Historique" },
  ];

  const mouvementsAffiches = mouvements.filter((m) =>
    correspond(m, mvtFiltreRapide),
  );

  return (
    <>
      <div className="topbar">
        <div className="brand">
          <img src="/logo-ocp.jpg" alt="OCP" className="ocp-mark-img-sm" />{" "}
          Moteurs
        </div>
        <div className="tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={"tab " + (view === t.id ? "active" : "")}
              onClick={() => setView(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <span className={"role-pill " + (isAdmin ? "admin" : "viewer")}>
          {isAdmin ? "Admin" : "Visiteur"}
        </span>
        <button className="logout-btn" onClick={handleLogout}>
          Se déconnecter
        </button>
      </div>

      <main>
        {view === "dashboard" && (
          <>
            <div className="page-head">
              <div>
                <h2>Tableau de bord</h2>
                <div className="sub">
                  {tousLesMoteurs.length} moteur(s) suivis au total
                </div>
              </div>
              {isAdmin && (
                <button
                  className="btn btn-primary"
                  onClick={() => setModal({ mode: "add" })}
                >
                  + Ajouter un moteur
                </button>
              )}
            </div>
            <div className="stat-grid">
              {ETATS.map((e) => {
                const locked = e.id === "en_stock" && !isAdmin;
                return (
                  <div
                    key={e.id}
                    className={"stat-card " + (locked ? "locked" : "")}
                    onClick={() => {
                      if (locked) return;
                      if (e.id === "en_stock") setView("stock");
                      else {
                        setEtatFiltre(e.id);
                        setView("etat");
                      }
                    }}
                  >
                    <div className="n">{locked ? "—" : compter(e.id)}</div>
                    <div className="l">
                      {e.label}
                      {locked ? " (accès admin)" : ""}
                    </div>
                  </div>
                );
              })}
              <div className="stat-card" onClick={() => setView("mvt")}>
                <div className="n">
                  {nbMouvements === null ? "—" : nbMouvements}
                </div>
                <div className="l">Mouvements</div>
              </div>
            </div>
            {(() => {
              const liste = moteurs
                .filter((m) => isAdmin || m.etat !== "en_stock")
                .slice(0, 12);
              return (
                <>
                  <BarreExport liste={liste} selectedIds={selectedIds} />
                  <ListeMoteurs
                    moteurs={liste}
                    isAdmin={isAdmin}
                    onEdit={(m) => setModal({ mode: "edit", moteur: m })}
                    onDelete={handleDelete}
                    selectable
                    selectedIds={selectedIds}
                    onToggleSelect={toggleSelect}
                    onToggleSelectAll={toggleSelectAll}
                  />
                </>
              );
            })()}
          </>
        )}

        {view === "stock" && isAdmin && (
          <>
            <div className="page-head">
              <div>
                <h2>Stock</h2>
                <div className="sub">
                  Moteurs disponibles en stock — visible uniquement par l'admin
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => setModal({ mode: "add" })}
              >
                + Ajouter un moteur
              </button>
            </div>
            <BarreFiltreRapide
              valeurs={filtreRapide}
              onChange={setFiltreRapide}
            />
            {(() => {
              const liste = moteurs.filter((m) => correspond(m, filtreRapide));
              return (
                <>
                  <BarreExport liste={liste} selectedIds={selectedIds} />
                  <ListeMoteurs
                    moteurs={liste}
                    isAdmin={isAdmin}
                    onEdit={(m) => setModal({ mode: "edit", moteur: m })}
                    onDelete={handleDelete}
                    selectable
                    selectedIds={selectedIds}
                    onToggleSelect={toggleSelect}
                    onToggleSelectAll={toggleSelectAll}
                  />
                </>
              );
            })()}
          </>
        )}

        {view === "etat" && (
          <>
            <div className="page-head">
              <div>
                <h2>{ETATS.find((e) => e.id === etatFiltre)?.label}</h2>
                <div className="sub">{moteurs.length} moteur(s)</div>
              </div>
              <button
                className="btn btn-ghost"
                onClick={() => setView("dashboard")}
              >
                ← Tableau de bord
              </button>
            </div>
            <BarreFiltreRapide
              valeurs={filtreRapide}
              onChange={setFiltreRapide}
            />
            {(() => {
              const liste = moteurs.filter((m) => correspond(m, filtreRapide));
              return (
                <>
                  <BarreExport liste={liste} selectedIds={selectedIds} />
                  <ListeMoteurs
                    moteurs={liste}
                    isAdmin={isAdmin}
                    onEdit={(m) => setModal({ mode: "edit", moteur: m })}
                    onDelete={handleDelete}
                    selectable
                    selectedIds={selectedIds}
                    onToggleSelect={toggleSelect}
                    onToggleSelectAll={toggleSelectAll}
                  />
                </>
              );
            })()}
          </>
        )}

        {view === "recherche" && (
          <>
            <div className="page-head">
              <div>
                <h2>Recherche</h2>
                <div className="sub">
                  Combinez matricule, puissance, forme et localisation — chaque
                  champ rempli affine les résultats
                </div>
              </div>
            </div>
            <RechercheAvancee valeurs={recherche} onChange={setRecherche} />
            {rechercheActive ? (
              <>
                <BarreExport liste={moteurs} selectedIds={selectedIds} />
                <ListeMoteurs
                  moteurs={moteurs}
                  isAdmin={isAdmin}
                  onEdit={(m) => setModal({ mode: "edit", moteur: m })}
                  onDelete={handleDelete}
                  selectable
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelect}
                  onToggleSelectAll={toggleSelectAll}
                />
              </>
            ) : (
              <div className="empty">
                <b>Remplissez au moins un critère</b>Vous pouvez en combiner
                plusieurs, ou n'en utiliser qu'un seul.
              </div>
            )}
          </>
        )}

        {view === "mvt" && (
          <>
            <div className="page-head">
              <div>
                <h2>Mouvements</h2>
                <div className="sub">
                  {mouvementsAffiches.length} mouvement(s) affiché(s)
                </div>
              </div>
              {isAdmin && (
                <button
                  className="btn btn-primary"
                  onClick={() => setMvtModal({ mode: "add" })}
                >
                  + Ajouter un mouvement
                </button>
              )}
            </div>
            <MvtFilter
              de={mvtDe}
              vers={mvtVers}
              onDe={setMvtDe}
              onVers={setMvtVers}
              onGo={() => {
                setMvtDeActif(mvtDe);
                setMvtVersActif(mvtVers);
              }}
            />
            <BarreFiltreRapide
              valeurs={mvtFiltreRapide}
              onChange={setMvtFiltreRapide}
            />
            <BarreExport
              liste={mouvementsAffiches}
              selectedIds={mvtSelectedIds}
              colonnes={MOUVEMENT_COLONNES}
              keyField="id"
            />
            <MouvementsListe
              mouvements={mouvementsAffiches}
              isAdmin={isAdmin}
              onEdit={(m) => setMvtModal({ mode: "edit", mouvement: m })}
              onDelete={handleDeleteMouvement}
              selectedIds={mvtSelectedIds}
              onToggleSelect={toggleSelectMvt}
              onToggleSelectAll={toggleSelectAllMvt}
            />
          </>
        )}

        {view === "historique" && (
          <>
            <div className="page-head">
              <div>
                <h2>Historique</h2>
                <div className="sub">
                  {historiqueFiltre.length} événement(s) affichés (300 max, les
                  plus récents)
                </div>
              </div>
            </div>
            <div className="toolbar">
              <input
                placeholder="Rechercher par matricule…"
                value={histRecherche}
                onChange={(e) => setHistRecherche(e.target.value)}
                style={{ flex: 1, minWidth: 200, maxWidth: 320 }}
              />
              <select
                value={histAction}
                onChange={(e) => setHistAction(e.target.value)}
                style={{ maxWidth: 200 }}
              >
                {ACTIONS_HISTORIQUE.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
            <HistoriqueList historique={historiqueFiltre} />
          </>
        )}
      </main>

      {modal && (
        <FormulaireAjout
          mode={modal.mode}
          moteur={modal.moteur}
          onSubmit={handleSubmitForm}
          onCancel={() => setModal(null)}
        />
      )}

      {mvtModal && (
        <FormulaireMouvement
          mode={mvtModal.mode}
          mouvement={mvtModal.mouvement}
          onSubmit={handleSubmitMouvement}
          onCancel={() => setMvtModal(null)}
        />
      )}

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: toast.isErr ? "var(--red)" : "var(--green-700)",
            color: "#fff",
            padding: "11px 18px",
            borderRadius: 9,
            fontSize: 13.5,
            fontWeight: 600,
            boxShadow: "0 10px 30px rgba(0,0,0,.25)",
            zIndex: 200,
          }}
        >
          {toast.msg}
        </div>
      )}
    </>
  );
}
