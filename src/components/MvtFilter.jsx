import AutocompleteInput from "./AutocompleteInput.jsx";
import { DE_OPTIONS, VERS_OPTIONS } from "../constants.js";

export default function MvtFilter({ de, vers, onDe, onVers, onGo }) {
  return (
    <div className="toolbar">
      <div style={{ minWidth: 200 }}>
        <AutocompleteInput
          options={DE_OPTIONS}
          value={de}
          onChange={onDe}
          placeholder="De…"
        />
      </div>
      <span style={{ color: "var(--ink-soft)" }}>→</span>
      <div style={{ minWidth: 200 }}>
        <AutocompleteInput
          options={VERS_OPTIONS}
          value={vers}
          onChange={onVers}
          placeholder="Vers…"
        />
      </div>
      <button className="btn btn-primary btn-sm" onClick={onGo}>
        Filtrer
      </button>
    </div>
  );
}
