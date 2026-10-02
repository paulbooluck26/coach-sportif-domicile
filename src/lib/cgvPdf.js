import { CGV_ARTICLES } from "@/lib/cgvTexte";
import { CGV_VERSION, IDENTITE_PRO } from "@/lib/legalConfig";

// Génère le PDF des CGV à partir du même texte source que la page /cgv
// (src/lib/cgvTexte.js) : le document téléchargé ne peut donc jamais
// différer de la version affichée et hachée sur les contrats. jsPDF est
// chargé à la demande pour ne pas alourdir le chargement du site.
const MARGE = 20;
const HAUT = 22;
const BAS = 20;
const INTERLIGNE = 5;

export async function genererCgvPdf() {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const largeurPage = doc.internal.pageSize.getWidth();
  const hauteurPage = doc.internal.pageSize.getHeight();
  const largeurTexte = largeurPage - 2 * MARGE;
  let y = HAUT;

  const assurerPlace = (hauteur) => {
    if (y + hauteur > hauteurPage - BAS) {
      doc.addPage();
      y = HAUT;
    }
  };

  // En-tête du document
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text("PHYSIS COACHING", MARGE, y);
  y += 9;
  doc.setFontSize(21);
  doc.setTextColor(33, 43, 35);
  doc.text("Conditions Générales de Vente", MARGE, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(`Version ${CGV_VERSION}`, MARGE, y);
  y += 4;
  doc.setDrawColor(200, 200, 200);
  doc.line(MARGE, y, largeurPage - MARGE, y);
  y += 4;

  for (const article of CGV_ARTICLES) {
    assurerPlace(14 + 2 * INTERLIGNE);
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(33, 43, 35);
    doc.text(article.titre, MARGE, y);
    y += 3;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(70, 70, 70);
    for (const paragraphe of article.paragraphes) {
      const lignes = doc.splitTextToSize(paragraphe, largeurTexte);
      y += 2.5;
      for (const ligne of lignes) {
        assurerPlace(INTERLIGNE);
        y += INTERLIGNE;
        doc.text(ligne, MARGE, y);
      }
    }
  }

  // Pied de page : identité + numérotation sur chaque page
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setDrawColor(220, 220, 220);
    doc.line(MARGE, hauteurPage - 14, largeurPage - MARGE, hauteurPage - 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.text(`${IDENTITE_PRO.nom} — SIRET ${IDENTITE_PRO.siret} — CGV ${CGV_VERSION}`, MARGE, hauteurPage - 9);
    doc.text(`Page ${i} / ${total}`, largeurPage - MARGE, hauteurPage - 9, { align: "right" });
  }

  doc.setProperties({
    title: `Conditions Générales de Vente — PHYSIS COACHING (${CGV_VERSION})`,
    subject: "Conditions Générales de Vente",
    author: "PHYSIS COACHING",
    creator: "physis-coaching.fr",
  });
  return doc;
}

export const nomFichierCgv = () => `physis-coaching-cgv-${CGV_VERSION}.pdf`;
