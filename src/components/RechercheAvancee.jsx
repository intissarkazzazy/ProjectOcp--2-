import AutocompleteInput from "./AutocompleteInput.jsx";
import { FORMES, LOCALISATIONS } from "../constants.js";

// Recherche multi-critères : chaque champ rempli s'ajoute en ET aux autres.
export default function RechercheAvancee({ valeurs, onChange }) {
  return (
    <div className="toolbar" style={{ flexWrap: "wrap" }}>
      <input
        placeholder="Matricule…"
        value={valeurs.matricule}
        onChange={(e) => onChange({ ...valeurs, matricule: e.target.value })}
        style={{ maxWidth: 160 }}
      />
      <input
        placeholder="Puissance (kW)…"
        value={valeurs.puissance}
        onChange={(e) => onChange({ ...valeurs, puissance: e.target.value })}
        style={{ maxWidth: 160 }}
      />
      <div style={{ minWidth: 160 }}>
        <AutocompleteInput
          options={FORMES}
          value={valeurs.forme}
          placeholder="Forme…"
          onChange={(v) => onChange({ ...valeurs, forme: v })}
        />
      </div>
      <div style={{ minWidth: 200 }}>
        <AutocompleteInput
          options={LOCALISATIONS}
          value={valeurs.localisation}
          placeholder="Localisation…"
          onChange={(v) => onChange({ ...valeurs, localisation: v })}
        />
      </div>
    </div>
  );
}
