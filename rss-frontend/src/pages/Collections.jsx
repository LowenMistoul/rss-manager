import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/axios";

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchCollections();
  }, []);

  async function fetchCollections() {
    try {
      const { data } = await api.get("/api/collections");
      setCollections(data);
    } catch (err) {
      console.error("Erreur récupération collections:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const { data } = await api.post("/api/collections", form);
      setCollections([...collections, data]); // mettre à jour la liste
      setForm({ name: "", description: "" });
      setShowForm(false);
    } catch (err) {
      console.error("Erreur création collection:", err);
    }
  }

  if (loading) return <p>Chargement…</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Mes collections</h1>

      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Nouvelle collection
      </button>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 p-4 border rounded">
          <input
            type="text"
            placeholder="Nom de la collection"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-2 mr-2"
            required
          />
          <input
            type="text"
            placeholder="Description (optionnel)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border p-2 mr-2"
          />
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
            Créer
          </button>
        </form>
      )}

      <ul className="space-y-3">
        {collections.map((c) => (
          <li key={c.id} className="p-4 border rounded hover:shadow">
            <Link to={`/collections/${c.id}`} className="text-lg font-semibold text-blue-600">
              {c.name}
            </Link>
            <p className="text-sm text-gray-600">{c.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
