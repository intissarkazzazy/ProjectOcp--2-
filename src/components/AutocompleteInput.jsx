import { useEffect, useRef, useState } from "react";

export default function AutocompleteInput({
  value,
  onChange,
  options,
  placeholder,
  name,
}) {
  const estConnue = value && options.includes(value);
  const [modeAutre, setModeAutre] = useState(!!value && !estConnue);
  const [texte, setTexte] = useState(estConnue ? value : "");
  const [autreTexte, setAutreTexte] = useState(!estConnue ? value || "" : "");
  const [ouvert, setOuvert] = useState(false);
  const [surligne, setSurligne] = useState(-1);
  const boxRef = useRef(null);
  const autreRef = useRef(null);

  useEffect(() => {
    const connue = value && options.includes(value);
    setModeAutre(!!value && !connue);
    setTexte(connue ? value : "");
    if (!connue) setAutreTexte(value || "");
  }, [value, options]);

  useEffect(() => {
    function onClickDehors(e) {
      if (boxRef.current && !boxRef.current.contains(e.target))
        setOuvert(false);
    }
    document.addEventListener("mousedown", onClickDehors);
    return () => document.removeEventListener("mousedown", onClickDehors);
  }, []);

  const suggestions = options.filter((o) =>
    o.toLowerCase().includes((texte || "").toLowerCase()),
  );

  function choisir(val) {
    setModeAutre(false);
    setTexte(val);
    onChange(val);
    setOuvert(false);
    setSurligne(-1);
  }

  function choisirAutre() {
    setModeAutre(true);
    setOuvert(false);
    setAutreTexte("");
    onChange("");
    setTimeout(() => autreRef.current?.focus(), 0);
  }

  function revenirListe() {
    setModeAutre(false);
    setTexte("");
    onChange("");
  }

  function onKeyDown(e) {
    if (!ouvert) return;
    const total = suggestions.length + 1;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSurligne((i) => Math.min(i + 1, total - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSurligne((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (surligne === suggestions.length) choisirAutre();
      else if (surligne >= 0 && suggestions[surligne])
        choisir(suggestions[surligne]);
    } else if (e.key === "Escape") {
      setOuvert(false);
    }
  }

  // Case séparée : tapée quand la personne a choisi "Autre"
  if (modeAutre) {
    return (
      <div className="autocomplete-autre-box">
        <input
          ref={autreRef}
          name={name}
          value={autreTexte}
          placeholder="Tapez votre choix…"
          onChange={(e) => {
            setAutreTexte(e.target.value);
            onChange(e.target.value);
          }}
        />
        <button
          type="button"
          className="autocomplete-retour"
          onClick={revenirListe}
        >
          ← choisir dans la liste
        </button>
      </div>
    );
  }

  return (
    <div className="autocomplete" ref={boxRef}>
      <input
        name={name}
        value={texte}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => {
          setTexte(e.target.value);
          onChange(e.target.value);
          setOuvert(true);
          setSurligne(-1);
        }}
        onFocus={() => setOuvert(true)}
        onKeyDown={onKeyDown}
      />
      {ouvert && (
        <ul className="autocomplete-list">
          {suggestions.map((s, i) => (
            <li
              key={s}
              className={i === surligne ? "active" : ""}
              onMouseDown={() => choisir(s)}
            >
              {s}
            </li>
          ))}
          <li
            className={
              "autocomplete-autre " +
              (surligne === suggestions.length ? "active" : "")
            }
            onMouseDown={choisirAutre}
          >
            Autre
          </li>
        </ul>
      )}
    </div>
  );
}
