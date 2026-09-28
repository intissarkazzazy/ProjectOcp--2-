const ACTION_LABEL = { ajout: "Ajout", modification: "Modification", mouvement: "Mouvement", suppression: "Suppression" };

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) +
    " · " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default function HistoriqueList({ historique }) {
  if (!historique.length) {
    return <div className="empty"><b>Aucun événement</b>Les ajouts, modifications, mouvements et suppressions apparaîtront ici.</div>;
  }
  return (
    <div className="card-panel">
      {historique.map((h) => (
        <div className="hist-item" key={h.id}>
          <div className={"hist-dot " + h.action}></div>
          <div className="hist-main">
            <div className="hist-top">
              <span className="hist-action">{ACTION_LABEL[h.action] || h.action}</span>
              <span className="mono" style={{ fontSize: 12.5 }}>{h.matricule}</span>
              <span className="hist-date">{fmtDate(h.date)}</span>
            </div>
            <div className="hist-detail">{h.details}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
