import { useState } from "react";
import api from "../lib/axios";

export default function ImportFeeds() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Veuillez sélectionner un fichier.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setMessage("");

      const { data } = await api.post("/api/feeds/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(` ${data.message}`);
    } catch (err) {
      console.error("Erreur import flux", err);
      setMessage(" Erreur lors de l'import des flux.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded bg-gray-50 mt-4">
      <h3 className="font-semibold mb-2">Importer des flux RSS</h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="file"
          accept=".json,.csv,.opml,.xml"
          onChange={handleFileChange}
          className="border p-2 rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Import en cours..." : "Importer"}
        </button>
      </form>

      {message && (
        <p className="mt-3 text-sm">{message}</p>
      )}
    </div>
  );
}
