export const LOCALISATIONS = [
  "Saake1",
  "Saake2",
  "M.Tekfen",
  "M.Z",
  "ME",
  "EC",
  "Installé",
  "En révision",
  "En attente révision",
  "Réforme",
];
export const DE_OPTIONS = ["Saake1", "Saake2", "M.Tekfen", "M.Z", "ME", "EC"];
export const VERS_OPTIONS = [
  "Saake1",
  "Saake2",
  "ME",
  "Faratec",
  "N.L",
  "A.L",
  "Anex",
];

export const FORMES = ["B3", "B5", "V1", "B35", "B34"];
export const VITESSES = ["750", "1000", "3000"];
export const FAMILLES = [
  "Pompe",
  "Ventilateur",
  "Élévateur",
  "Bonde",
  "Agitateur",
  "Dévibrant",
  "Broyeurs",
  "Virole",
];
export const ETATS = [
  { id: "en_stock", label: "En stock" },
  { id: "en_revision", label: "En révision" },
  { id: "en_attente_revision", label: "En attente révision" },
  { id: "en_attente_reforme", label: "En attente réforme" },
  { id: "installe", label: "Installé" },
];
export const ETAT_LABEL = Object.fromEntries(ETATS.map((e) => [e.id, e.label]));

// Colonnes affichées dans les listes de moteurs (ordre + libellés).
export const COLONNES = [
  { key: "matricule", label: "Matricule" },
  { key: "date", label: "Date" },
  { key: "forme", label: "Forme" },
  { key: "puissance", label: "Puissance" },
  { key: "vitesse", label: "Vitesse" },
  { key: "famille", label: "Famille" },
  { key: "localisation", label: "Localisation" },
  { key: "de", label: "De" },
  { key: "vers", label: "Vers" },
  { key: "etat", label: "État" },
  { key: "revisionCount", label: "Rév." },
  { key: "numSerie", label: "N° série" },
  { key: "marque", label: "Marque" },
  { key: "equipement", label: "Équipement" },
  { key: "repereCompatible", label: "Repère compatible" },
  { key: "diametreArbre", label: "Diamètre arbre" },
  { key: "hauteurAxe", label: "Hauteur d'axe" },
  { key: "entraxeA", label: "Entraxe A" },
  { key: "entraxeB", label: "Entraxe B" },
  { key: "dimP", label: "Dimension P" },
  { key: "dimM", label: "Dimension M" },
  { key: "observation", label: "Observation" },
];
export const MOUVEMENT_COLONNES = [
  { key: "date", label: "Date" },
  { key: "matricule", label: "Matricule" },
  { key: "marque", label: "Marque N°série" },
  { key: "puissance", label: "Puissance" },
  { key: "forme", label: "Forme" },
  { key: "etat", label: "État" },
  { key: "compteur_revision", label: "Compt. Rév." },
  { key: "destination", label: "Destination" },
  { key: "localisation", label: "Localisation" },
  { key: "famille", label: "Famille" },
  { key: "entite", label: "Entité" },
  { key: "equipements", label: "Équipements" },
  { key: "de_lieu", label: "De" },
  { key: "vers_lieu", label: "Vers" },
  { key: "di", label: "DI" },
  { key: "ot", label: "OT" },
  { key: "avis", label: "Avis" },
];
