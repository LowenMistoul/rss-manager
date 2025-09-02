import api from "../lib/axios";

export async function downloadFeeds(format = "json") {
  try {
    const response = await api.get(`/api/feeds/export/${format}`, {
      responseType: "blob", // ⚠️ important pour forcer un téléchargement
    });

    // Créer un lien temporaire pour télécharger le fichier
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;

    // Choisir le nom du fichier
    const fileName = `feeds.${format === "opml" ? "opml" : format}`;
    link.setAttribute("download", fileName);

    document.body.appendChild(link);
    link.click();

    // Nettoyer
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Erreur export feeds", err);
    alert("Impossible d’exporter vos flux.");
  }
}
