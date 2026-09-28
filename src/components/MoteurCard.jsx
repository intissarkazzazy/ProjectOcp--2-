import { COLONNES, ETAT_LABEL } from "../constants.js";

function formatCell(m, key) {
  if (key === "puissance") return m.puissance ? m.puissance + " kW" : "—";
  if (key === "vitesse") return m.vitesse ? m.vitesse + " tr/min" : "—";
  if (key === "revisionCount") return m.revisionCount || 0;
  return m[key] || "—";
}

export default function MoteurCard({
  moteur,
  isAdmin,
  onEdit,
  onDelete,
  selectable,
  selected,
  onToggleSelect,
}) {
  return (
    <tr>
      {selectable && (
        <td>
          <input
            type="checkbox"
            checked={!!selected}
            onChange={() => onToggleSelect(moteur.matricule)}
          />
        </td>
      )}
      {COLONNES.map((c) => (
        <td key={c.key} className={c.key === "matricule" ? "mono" : ""}>
          {c.key === "etat" ? (
            <span className={"etat-tag etat-" + moteur.etat}>
              {ETAT_LABEL[moteur.etat] || moteur.etat}
            </span>
          ) : (
            formatCell(moteur, c.key)
          )}
        </td>
      ))}
      {isAdmin && (
        <td className="row-actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onEdit(moteur)}
          >
            Modifier
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(moteur.matricule)}
          >
            Suppr.
          </button>
        </td>
      )}
    </tr>
  );
}
