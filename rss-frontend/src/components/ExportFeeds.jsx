import { useState } from "react";
import { downloadFeeds } from "../services/download";

export default function ExportFeeds() {
  const [format, setFormat] = useState("json");

  const handleExport = () => {
    downloadFeeds(format);
  };

  return (
    <div className="p-4 border rounded bg-gray-50 mt-4">
      <h3 className="font-semibold mb-2">Exporter mes flux</h3>
      <div className="flex gap-3 items-center">
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="json">JSON</option>
          <option value="csv">CSV</option>
          <option value="opml">OPML</option>
        </select>

        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Télécharger
        </button>
      </div>
    </div>
  );
}
