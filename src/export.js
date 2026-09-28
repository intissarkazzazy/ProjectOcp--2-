import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { COLONNES, ETAT_LABEL } from "./constants.js";

function ligneDe(item, colonnes) {
  return colonnes.map((c) => {
    if (c.key === "etat" && ETAT_LABEL[item.etat]) return ETAT_LABEL[item.etat];
    return item[c.key] ?? "";
  });
}

export function exporterExcel(
  items,
  nomFichier = "export",
  colonnes = COLONNES,
) {
  const entetes = colonnes.map((c) => c.label);
  const lignes = items.map((it) => ligneDe(it, colonnes));
  const feuille = XLSX.utils.aoa_to_sheet([entetes, ...lignes]);
  const classeur = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(classeur, feuille, "Export");
  XLSX.writeFile(classeur, `${nomFichier}.xlsx`);
}

export function exporterPDF(items, nomFichier = "export", colonnes = COLONNES) {
  const doc = new jsPDF({ orientation: "landscape" });
  const entetes = colonnes.map((c) => c.label);
  const lignes = items.map((it) => ligneDe(it, colonnes));

  doc.setFontSize(14);
  doc.text("Gestion des Moteurs — OCP", 14, 14);
  doc.setFontSize(9);
  doc.text(new Date().toLocaleDateString("fr-FR"), 14, 20);

  autoTable(doc, {
    head: [entetes],
    body: lignes,
    startY: 24,
    styles: { fontSize: 6.5, cellPadding: 1.5 },
    headStyles: { fillColor: [14, 107, 64], textColor: 255 },
    margin: { left: 10, right: 10 },
  });

  doc.save(`${nomFichier}.pdf`);
}
