import { useEffect, useState } from "react";
import api from "../lib/axios";
import { useAuthCtx } from "../context/AuthContext";

export default function ArticleComments({ articleId, collectionId }) {
  const { user } = useAuthCtx();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // Charger les commentaires au montage
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data } = await api.get(`/api/articles/${articleId}/comments`);
        setComments(data);
      } catch (err) {
        console.error("Erreur récupération commentaires", err);
      }
    };
    fetchComments();
  }, [articleId]);

  // Envoyer un commentaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const { data } = await api.post(`/api/articles/${articleId}/comments`, {
        content: newComment.trim(),
        collectionId,
      });
      setNewComment("");
      setComments((prev) => [...prev, data]); // ajouter dans la liste locale
    } catch (err) {
      console.error("Erreur envoi commentaire", err);
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Commentaires</h3>

      <ul className="space-y-2">
        {comments.map((c) => (
          <li
            key={c.id}
            className="p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
          >
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <strong>{c.author?.displayName || c.userId}</strong> –{" "}
              {new Date(c.createdAt).toLocaleString()}
            </p>
            <p>{c.content}</p>
            {c.editedAt && (
              <span className="text-xs text-gray-500">(modifié)</span>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Écrire un commentaire..."
          className="flex-1 border rounded p-2 dark:bg-gray-800 dark:text-white"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
