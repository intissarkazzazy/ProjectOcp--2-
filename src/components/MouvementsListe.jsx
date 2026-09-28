function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function MouvementsListe({
  mouvements,
  isAdmin,
  onEdit,
  onDelete,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}) {
  if (!mouvements.length) {
    return (
      <div className="table-wrap">
        <div className="empty">
          <b>Aucun mouvement</b>Rien à afficher pour le moment.
        </div>
      </div>
    );
  }
  const touteSelectionnee =
    mouvements.length > 0 && mouvements.every((m) => selectedIds?.has(m.id));
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={touteSelectionnee}
                onChange={() => onToggleSelectAll(mouvements)}
              />
            </th>
            <th>Date</th>
            <th>Matricule</th>
            <th>Marque N°série</th>
            <th>Puissance</th>
            <th>Forme</th>
            <th>État</th>
            <th>Compt. Rév.</th>
            <th>Destination</th>
            <th>Localisation</th>
            <th>Famille</th>
            <th>Entité</th>
            <th>Équipements</th>
            <th>De</th>
            <th>Vers</th>
            <th>DI</th>
            <th>OT</th>
            <th>Avis</th>
            {isAdmin && <th></th>}
          </tr>
        </thead>
        <tbody>
          {mouvements.map((m) => (
            <tr key={m.id}>
              <td>
                <input
                  type="checkbox"
                  checked={!!selectedIds?.has(m.id)}
                  onChange={() => onToggleSelect(m.id)}
                />
              </td>
              <td>{fmtDate(m.date)}</td>
              <td className="mono">{m.matricule}</td>
              <td>{m.marque || "—"}</td>
              <td>{m.puissance || "—"}</td>
              <td>{m.forme || "—"}</td>
              <td>{m.etat || "—"}</td>
              <td>{m.compteur_revision ?? "—"}</td>
              <td>{m.destination || "—"}</td>
              <td>{m.localisation || "—"}</td>
              <td>{m.famille || "—"}</td>
              <td>{m.entite || "—"}</td>
              <td>{m.equipements || "—"}</td>
              <td>{m.de_lieu || "—"}</td>
              <td>{m.vers_lieu || "—"}</td>
              <td>{m.di || "—"}</td>
              <td>{m.ot || "—"}</td>
              <td>{m.avis || "—"}</td>
              {isAdmin && (
                <td className="row-actions">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => onEdit(m)}
                  >
                    Modifier
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => onDelete(m.id)}
                  >
                    Suppr.
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
