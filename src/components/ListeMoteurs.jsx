import { COLONNES } from "../constants.js";
import MoteurCard from "./MoteurCard.jsx";

export default function ListeMoteurs({
  moteurs,
  isAdmin,
  onEdit,
  onDelete,
  titre,
  selectable,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}) {
  if (!moteurs.length) {
    return (
      <div className="table-wrap">
        <div className="empty">
          <b>Aucun moteur</b>Rien à afficher pour le moment.
        </div>
      </div>
    );
  }

  const touteSelectionnee =
    selectable &&
    moteurs.length > 0 &&
    moteurs.every((m) => selectedIds?.has(m.matricule));

  return (
    <>
      {titre && <h3 style={{ margin: "0 0 10px" }}>{titre}</h3>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {selectable && (
                <th>
                  <input
                    type="checkbox"
                    checked={touteSelectionnee}
                    onChange={() => onToggleSelectAll(moteurs)}
                  />
                </th>
              )}
              {COLONNES.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
              {isAdmin && <th></th>}
            </tr>
          </thead>
          <tbody>
            {moteurs.map((m) => (
              <MoteurCard
                key={m.matricule}
                moteur={m}
                isAdmin={isAdmin}
                onEdit={onEdit}
                onDelete={onDelete}
                selectable={selectable}
                selected={selectedIds?.has(m.matricule)}
                onToggleSelect={onToggleSelect}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
