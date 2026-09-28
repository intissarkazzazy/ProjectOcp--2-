import { useState } from "react";
import { DE_OPTIONS, VERS_OPTIONS, LOCALISATIONS } from "../constants.js";
import AutocompleteInput from "./AutocompleteInput.jsx";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function FormulaireMouvement({
  mode,
  mouvement,
  onSubmit,
  onCancel,
}) {
  const m = mouvement || { date: todayISO() };

  const [matricule, setMatricule] = useState(m.matricule || "");
  const [date, setDate] = useState(m.date || todayISO());
  const [marque, setMarque] = useState(m.marque || "");
  const [puissance, setPuissance] = useState(m.puissance || "");
  const [forme, setForme] = useState(m.forme || "");
  const [etat, setEtat] = useState(m.etat || "");
  const [compteurRevision, setCompteurRevision] = useState(
    m.compteur_revision ?? "",
  );
  const [destination, setDestination] = useState(m.destination || "");
  const [localisation, setLocalisation] = useState(m.localisation || "");
  const [famille, setFamille] = useState(m.famille || "");
  const [entite, setEntite] = useState(m.entite || "");
  const [equipements, setEquipements] = useState(m.equipements || "");
  const [de, setDe] = useState(m.de_lieu || "");
  const [vers, setVers] = useState(m.vers_lieu || "");
  const [di, setDi] = useState(m.di || "");
  const [ot, setOt] = useState(m.ot || "");
  const [avis, setAvis] = useState(m.avis || "");

  function handleSubmit(e) {
    e.preventDefault();
    if (!matricule.trim()) return;
    onSubmit({
      matricule: matricule.trim(),
      date,
      marque,
      puissance,
      forme,
      etat,
      compteurRevision:
        compteurRevision === "" ? null : Number(compteurRevision),
      destination,
      localisation,
      famille,
      entite,
      equipements,
      de,
      vers,
      di,
      ot,
      avis,
    });
  }

  return (
    <div
      className="overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="modal">
        <div className="modal-head">
          <h3>
            {mode === "add" ? "Ajouter un mouvement" : "Modifier le mouvement"}
          </h3>
          <button className="modal-close" onClick={onCancel} type="button">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-field">
                <label>Matricule *</label>
                <input
                  required
                  value={matricule}
                  onChange={(e) => setMatricule(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Marque N°série</label>
                <input
                  value={marque}
                  onChange={(e) => setMarque(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Puissance (kW)</label>
                <input
                  value={puissance}
                  onChange={(e) => setPuissance(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Forme</label>
                <input
                  value={forme}
                  onChange={(e) => setForme(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>État</label>
                <input value={etat} onChange={(e) => setEtat(e.target.value)} />
              </div>

              <div className="form-field">
                <label>Compteur révision</label>
                <input
                  type="number"
                  value={compteurRevision}
                  onChange={(e) => setCompteurRevision(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Destination</label>
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Localisation</label>
                <AutocompleteInput
                  options={LOCALISATIONS}
                  value={localisation}
                  onChange={setLocalisation}
                  placeholder="Localisation…"
                />
              </div>
              <div className="form-field">
                <label>Famille</label>
                <input
                  value={famille}
                  onChange={(e) => setFamille(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Entité</label>
                <input
                  value={entite}
                  onChange={(e) => setEntite(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Équipements</label>
                <input
                  value={equipements}
                  onChange={(e) => setEquipements(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>De</label>
                <AutocompleteInput
                  options={DE_OPTIONS}
                  value={de}
                  onChange={setDe}
                  placeholder="De…"
                />
              </div>
              <div className="form-field">
                <label>Vers</label>
                <AutocompleteInput
                  options={VERS_OPTIONS}
                  value={vers}
                  onChange={setVers}
                  placeholder="Vers…"
                />
              </div>

              <div className="form-field">
                <label>DI</label>
                <input value={di} onChange={(e) => setDi(e.target.value)} />
              </div>
              <div className="form-field">
                <label>OT</label>
                <input value={ot} onChange={(e) => setOt(e.target.value)} />
              </div>

              <div className="form-field full">
                <label>Avis</label>
                <input value={avis} onChange={(e) => setAvis(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              {mode === "add" ? "Ajouter" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
