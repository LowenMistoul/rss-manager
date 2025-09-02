import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/axios";
import { useDebounce } from "use-debounce";
import ArticleComments from "../components/ArticleComment";
import { Link } from "react-router-dom";

export default function Articles() {
  const { collectionId } = useParams(); // si tu appelles /collections/:collectionId/articles
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    q: "",
    isRead: "",
    isFavorite: "",
    source: "",
    tag: ""
  });
  const [debouncedQ] = useDebounce(filters.q, 500);

  // Marquer comme lu / non lu
const toggleRead = async (articleId, current) => {
    try {
      const { data } = await api.put(`/api/articles/${articleId}`, {
        isRead: !current,
      });
      setArticles((prev) =>
        prev.map((a) => (a.id === articleId ? data : a))
      );
    } catch (err) {
      console.error("Erreur maj lecture", err);
    }
  };
  
  // Ajouter / retirer des favoris
  const toggleFavorite = async (articleId, current) => {
    try {
      const { data } = await api.put(`/api/articles/${articleId}`, {
        isFavorite: !current,
      });
      setArticles((prev) =>
        prev.map((a) => (a.id === articleId ? data : a))
      );
    } catch (err) {
      console.error("Erreur maj favori", err);
    }
  };
  
  

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError("");
        const params = new URLSearchParams();
        params.append("collectionId", collectionId);
  
        if (debouncedQ) params.append("q", debouncedQ); 
        if (filters.isRead !== "") params.append("isRead", filters.isRead);
        if (filters.isFavorite !== "") params.append("isFavorite", filters.isFavorite);
        if (filters.source) params.append("source", filters.source);
        if (filters.tag) params.append("tag", filters.tag);
  
        const { data } = await api.get(`/api/articles/search?${params.toString()}`);
        setArticles(data);
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement des articles.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchArticles();
  }, [collectionId, debouncedQ, filters.isRead, filters.isFavorite, filters.source, filters.tag]);
  

  return (
    <div className="p-6">
        <div className="mb-6 p-4 border rounded bg-gray-50">
        <h3 className="font-semibold mb-3">Filtres</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Recherche texte */}
            <input
            type="text"
            placeholder="Rechercher..."
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            className="border p-2 rounded w-full"
            />

            {/* Lu / Non lu */}
            <select
            value={filters.isRead}
            onChange={(e) => setFilters({ ...filters, isRead: e.target.value })}
            className="border p-2 rounded w-full"
            >
            <option value="">Tous</option>
            <option value="true">Lus</option>
            <option value="false">Non lus</option>
            </select>

            {/* Favoris */}
            <select
            value={filters.isFavorite}
            onChange={(e) => setFilters({ ...filters, isFavorite: e.target.value })}
            className="border p-2 rounded w-full"
            >
            <option value="">Tous</option>
            <option value="true">Favoris</option>
            <option value="false">Non favoris</option>
            </select>

            {/* Source */}
            <input
            type="text"
            placeholder="Source (nom du flux)"
            value={filters.source}
            onChange={(e) => setFilters({ ...filters, source: e.target.value })}
            className="border p-2 rounded w-full"
            />

            {/* Tag */}
            <input
            type="text"
            placeholder="Tag"
            value={filters.tag}
            onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
            className="border p-2 rounded w-full"
            />
        </div>
      </div>
      <button
        className="mt-3 px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200"
        onClick={() =>
            setFilters({ q: "", isRead: "", isFavorite: "", source: "", tag: "" })
        }
        >
        Réinitialiser
      </button>




      <h2 className="text-xl font-semibold mb-4">Articles de la collection</h2>

      {loading && <p>Chargement...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="space-y-4">
        {articles.map((a) => (
          <div key={a.id} className="border p-4 rounded shadow-sm">
            <h3 className="font-semibold">{a.title}</h3>
            <p className="text-sm text-gray-600">
              Source : {a.Feed?.title || "Inconnu"} – {a.pubDate ? new Date(a.pubDate).toLocaleDateString() : ""}
            </p>
            <p className="mt-2 text-gray-800">{a.contentSnippet?.slice(0, 200)}...</p>
            <ArticleComments articleId={a.id} collectionId={a.collectionId}/>
            <div className="mt-2 flex gap-3 text-sm">
            <button
                onClick={() => toggleRead(a.id, a.isRead)}
                className={`px-2 py-1 rounded border ${a.isRead ? "bg-green-100" : "bg-gray-100"}`}
            >
                {a.isRead ? "Marquer non lu" : "Marquer lu"}
            </button>

            <button
                onClick={() => toggleFavorite(a.id, a.isFavorite)}
                className={`px-2 py-1 rounded border ${a.isFavorite ? "bg-yellow-100" : "bg-gray-100"}`}
            >
                {a.isFavorite ? "Retirer favori" : "Ajouter favori"}
            </button>
            </div>
            <a
              href={a.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-blue-600 hover:underline text-sm"
            >
              Lire l’article complet →
            </a>
          </div>
        ))}
        {articles.length === 0 && !loading && (
          <p className="text-gray-500">Aucun article trouvé.</p>
        )}
      </div>
    </div>
  );
}
