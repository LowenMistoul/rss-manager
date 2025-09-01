import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/axios";

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");

  // charger les collections au montage
  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const { data } = await api.get("/api/collections");
      setCollections(data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les collections");
    }
  };

  const createCollection = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const { data } = await api.post("/api/collections", { name: newName });
      setCollections([...collections, data]);
      setNewName("");
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la création");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Mes collections</h2>

      {error && <div className="text-red-600 mb-3">{error}</div>}

      <form onSubmit={createCollection} className="flex gap-2 mb-6">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 border p-2 rounded"
          placeholder="Nom de la nouvelle collection"
        />
        <button className="px-4 py-2 border rounded">Créer</button>
      </form>

      <ul className="space-y-2">
        {collections.map((c) => (
          <li key={c.id} className="border p-3 rounded">
            <Link to={`/collections/${c.id}`} className="font-medium text-blue-600">
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
