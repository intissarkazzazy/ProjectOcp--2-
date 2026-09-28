import { useState } from "react";
import {
  FORMES,
  VITESSES,
  FAMILLES,
  ETATS,
  LOCALISATIONS,
  DE_OPTIONS,
  VERS_OPTIONS,
} from "../constants.js";
import AutocompleteInput from "./AutocompleteInput.jsx";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function FormulaireAjout({ mode, moteur, onSubmit, onCancel }) {
  const m = moteur || { date: todayISO(), etat: "en_stock" };

  const [matricule, setMatricule] = useState(m.matricule || "");
  const [date, setDate] = useState(m.date || todayISO());
  const [puissance, setPuissance] = useState(m.puissance || "");
  const [numSerie, setNumSerie] = useState(m.numSerie || "");
  const [marque, setMarque] = useState(m.marque || "");
  const [localisation, setLocalisation] = useState(m.localisation || "");
  const [equipement, setEquipement] = useState(m.equipement || "");
  const [de, setDe] = useState(m.de || "");
  const [vers, setVers] = useState(m.vers || "");
  const [etat, setEtat] = useState(m.etat || "en_stock");
  const [repereCompatible, setRepereCompatible] = useState(
    m.repereCompatible || "",
  );
  const [diametreArbre, setDiametreArbre] = useState(m.diametreArbre || "");
  const [hauteurAxe, setHauteurAxe] = useState(m.hauteurAxe || "");
  const [entraxeA, setEntraxeA] = useState(m.entraxeA || "");
  const [entraxeB, setEntraxeB] = useState(m.entraxeB || "");
  const [dimP, setDimP] = useState(m.dimP || "");
  const [dimM, setDimM] = useState(m.dimM || "");
  const [forme, setForme] = useState(m.forme || "");
  const [vitesse, setVitesse] = useState(m.vitesse || "");
  const [famille, setFamille] = useState(m.famille || "");
  const [observation, setObservation] = useState(m.observation || "");

  function handleSubmit(e) {
    e.preventDefault();
    if (!matricule.trim()) return;

    onSubmit({
      matricule: matricule.trim(),
      date,
      puissance,
      numSerie,
      marque,
      localisation,
      equipement,
      de,
      vers,
      etat,
      repereCompatible,
      diametreArbre,
      hauteurAxe,
      entraxeA,
      entraxeB,
      dimP,
      dimM,
      forme,
      vitesse,
      famille,
      observation,
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
            {mode === "add"
              ? "Ajouter un moteur"
              : "Modifier le moteur " + (m.matricule || "")}
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
                <label>Puissance (kW)</label>
                <input
                  value={puissance}
                  onChange={(e) => setPuissance(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>N° série</label>
                <input
                  value={numSerie}
                  onChange={(e) => setNumSerie(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Forme</label>
                <AutocompleteInput
                  options={FORMES}
                  value={forme}
                  onChange={setForme}
                  placeholder="B3, B5, V1, B35, B34…"
                />
              </div>

              <div className="form-field">
                <label>Vitesse (tr/min)</label>
                <AutocompleteInput
                  options={VITESSES}
                  value={vitesse}
                  onChange={setVitesse}
                  placeholder="750, 1000, 3000…"
                />
              </div>

              <div className="form-field">
                <label>Famille</label>
                <AutocompleteInput
                  options={FAMILLES}
                  value={famille}
                  onChange={setFamille}
                  placeholder="Pompe, Ventilateur…"
                />
              </div>

              <div className="form-field">
                <label>État</label>
                <select value={etat} onChange={(e) => setEtat(e.target.value)}>
                  {ETATS.map((e2) => (
                    <option key={e2.id} value={e2.id}>
                      {e2.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Position géographique</label>
                <AutocompleteInput
                  options={LOCALISATIONS}
                  value={localisation}
                  onChange={setLocalisation}
                  placeholder="Saake1, Saake2, M.Tekfen, M.Z, ME, EC…"
                />
              </div>
              <div className="form-field">
                <label>Équipement</label>
                <input
                  value={equipement}
                  onChange={(e) => setEquipement(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>De</label>
                <AutocompleteInput
                  options={DE_OPTIONS}
                  value={de}
                  onChange={setDe}
                  placeholder="Saake1, Saake2, M.Tekfen, M.Z, ME, EC…"
                />
              </div>
              <div className="form-field">
                <label>Vers</label>
                <AutocompleteInput
                  options={VERS_OPTIONS}
                  value={vers}
                  onChange={setVers}
                  placeholder="Saake1, Saake2, ME, Faratec, N.L, A.L, Anex…"
                />
              </div>

              <div className="form-field">
                <label>Marque</label>
                <input
                  value={marque}
                  onChange={(e) => setMarque(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Repère compatible</label>
                <input
                  value={repereCompatible}
                  onChange={(e) => setRepereCompatible(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Diamètre arbre</label>
                <input
                  value={diametreArbre}
                  onChange={(e) => setDiametreArbre(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Hauteur d'axe</label>
                <input
                  value={hauteurAxe}
                  onChange={(e) => setHauteurAxe(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Entraxe A</label>
                <input
                  value={entraxeA}
                  onChange={(e) => setEntraxeA(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Entraxe B</label>
                <input
                  value={entraxeB}
                  onChange={(e) => setEntraxeB(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>Dimension P</label>
                <input value={dimP} onChange={(e) => setDimP(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Dimension M</label>
                <input value={dimM} onChange={(e) => setDimM(e.target.value)} />
              </div>

              <div className="form-field full">
                <label>Observation</label>
                <textarea
                  rows="3"
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              {mode === "add" ? "Ajouter le moteur" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
