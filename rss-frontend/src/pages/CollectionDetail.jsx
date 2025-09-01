import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/axios";
import { io } from "socket.io-client";
import { useAuthCtx } from "../context/AuthContext";

const socket = io(import.meta.env.VITE_API_BASE_URL, {
    auth: { token: localStorage.getItem("token") },
    transports: ["websocket"]
  });

const ROLE_OPTIONS = [
  { value: "viewer", label: "Viewer (lecture)" },
  { value: "editor", label: "Editor (édition)" },
  { value: "admin",  label: "Admin (gestion)" },
];

export default function CollectionDetail() {
  const { collectionId } = useParams();

  // --- états Collection & Feeds (déjà vus)
  const [collection, setCollection] = useState(null);
  const [feeds, setFeeds] = useState([]);
  const [newFeed, setNewFeed] = useState({ title: "", url: "" });

  // --- états Members
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState({ email: "", role: "viewer" });

  // --- UI
  const [error, setError] = useState("");
  const [memberError, setMemberError] = useState("");
  const [memberInfo, setMemberInfo] = useState("");

  //---chat
  const { user } = useAuthCtx();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Quand on ouvre la collection, rejoindre la room
  useEffect(() => {
    if (!collectionId) return;
  
    socket.connect();
    socket.emit("collection:join", collectionId);
  
    // récupérer l’historique des messages
    api.get(`/api/collections/${collectionId}/messages`)
      .then(res => setMessages(res.data))
      .catch(err => console.error("Erreur chargement messages", err));
  
    // écouter les nouveaux messages temps réel
    socket.on("message:new", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
  
    return () => {
      socket.emit("collection:leave", collectionId);
      socket.off("message:new");
      socket.disconnect();
    };
  }, [collectionId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
  
    try {
      const { data } = await api.post(`/api/collections/${collectionId}/messages`, {
        content: newMessage
      });
  
      // On ajoute directement le message (enrichi avec User)
      setMessages((prev) => [...prev, data]);
      setNewMessage("");
    } catch (err) {
      console.error("Erreur envoi message", err);
    }
  };
  
  

  // Charger la collection + ses feeds + ses membres
  useEffect(() => {
    fetchCollection();
    fetchFeeds();
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionId]);

  // ====== COLLECTION ======
  const fetchCollection = async () => {
    setError("");
    try {
      const { data } = await api.get(`/api/collections/${collectionId}`);
      setCollection(data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger la collection");
    }
  };

  // ====== FEEDS ======
  const fetchFeeds = async () => {
    try {
      const { data } = await api.get(`/api/feeds/collection/${collectionId}`);
      setFeeds(data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les flux");
    }
  };

  const addFeed = async (e) => {
    e.preventDefault();
    if (!newFeed.title.trim() || !newFeed.url.trim()) return;
    try {
      const { data } = await api.post("/api/feeds", {
        ...newFeed,
        collectionId,
      });
      setFeeds((prev) => [...prev, data]);
      setNewFeed({ title: "", url: "" });
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l’ajout du flux");
    }
  };

  // ====== MEMBERS ======
  const fetchMembers = async () => {
    setMemberError("");
    setMemberInfo("");
    try {
      const { data } = await api.get(`/api/collections/${collectionId}/members`);
      // on s’attend à recevoir un tableau de "membership" :
      // { id, userId, role, user: { email, displayName } }
      setMembers(data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        setMemberError("Accès refusé : vous devez être membre pour voir la liste.");
      } else {
        setMemberError("Impossible de charger les membres.");
      }
    }
  };

  const addMember = async (e) => {
    e.preventDefault();
    setMemberError("");
    setMemberInfo("");
  
    if (!newMember.email.trim()) {
      setMemberError("Email requis pour ajouter un membre.");
      return;
    }
  
    try {
      const lookup = await api.get(`/api/users/lookup?email=${encodeURIComponent(newMember.email)}`);
      const userId = lookup.data.id;
  
      const { data } = await api.post(`/api/collections/${collectionId}/members`, {
        userId,
        role: newMember.role,
      });
  
      setMembers((prev) => [...prev, data]);
      setNewMember({ email: "", role: "viewer" });
      setMemberInfo("Membre ajouté ");
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        setMemberError("Utilisateur introuvable");
      } else if (err.response?.status === 400) {
        setMemberError(err.response.data.message || "Déjà membre");
      } else if (err.response?.status === 403) {
        setMemberError("Action interdite : admin/owner requis.");
      } else {
        setMemberError("Erreur lors de l’ajout du membre.");
      }
    }
  };
  

  const updateMemberRole = async (memberId, role) => {
    setMemberError("");
    setMemberInfo("");
    try {
      const { data } = await api.put(
        `/api/collections/${collectionId}/members/${memberId}`,
        { role }
      );
  
      // remplacer directement l’objet reçu
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? data : m))
      );
  
      setMemberInfo(`Rôle mis à jour pour ${data.User?.email || data.userId} `);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        setMemberError("Action interdite : admin/owner requis.");
      } else {
        setMemberError("Erreur lors de la mise à jour du rôle.");
      }
    }
  };

  const removeMember = async (memberId) => {
    setMemberError("");
    setMemberInfo("");
    try {
      const { data } = await api.delete(
        `/api/collections/${collectionId}/members/${memberId}`
      );
  
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
  
      setMemberInfo(
        `Membre ${data.removed?.User?.email || data.removed?.userId} supprimé `
      );
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        setMemberError("Action interdite : admin/owner requis.");
      } else {
        setMemberError("Erreur lors de la suppression du membre.");
      }
    }
  };

  if (!collection) return <div>Chargement...</div>;

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <header>
        <h2 className="text-2xl font-semibold mb-1">{collection.name}</h2>
        <p className="text-sm text-gray-600">
          {collection.description || "Pas de description"}
        </p>
      </header>

      {/* FEEDS */}
      <section>
        <h3 className="font-semibold mb-3">Flux RSS</h3>

        <ul className="space-y-2 mb-6">
          {feeds.map((f) => (
            <li key={f.id} className="border p-2 rounded">
              <div className="font-medium">{f.title}</div>
              <a
                href={f.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 text-sm"
              >
                {f.url}
              </a>
            </li>
          ))}
          {feeds.length === 0 && (
            <li className="text-sm text-gray-500">Aucun flux pour l’instant.</li>
          )}
        </ul>

        <form onSubmit={addFeed} className="space-y-2 border p-3 rounded w-full max-w-md">
          <h4 className="font-semibold">Ajouter un flux</h4>
          <input
            className="w-full border p-2 rounded"
            placeholder="Titre"
            value={newFeed.title}
            onChange={(e) => setNewFeed({ ...newFeed, title: e.target.value })}
          />
          <input
            className="w-full border p-2 rounded"
            placeholder="URL du flux"
            value={newFeed.url}
            onChange={(e) => setNewFeed({ ...newFeed, url: e.target.value })}
          />
          <button className="px-4 py-2 border rounded">Ajouter</button>
        </form>
      </section>

      {/* MEMBERS */}
      <section>
        <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Membres de la collection</h3>
            <div className="text-sm text-gray-500">
            Seuls les <b>admins/owners</b> peuvent modifier la liste.
            </div>
        </div>

        {memberError && <div className="text-red-600 mb-3">{memberError}</div>}
        {memberInfo && <div className="text-green-700 mb-3">{memberInfo}</div>}

        <div className="space-y-2 mb-6">
            {members.map((m) => (
            <div
                key={m.id}
                className="border p-3 rounded flex items-center justify-between gap-4"
            >
                <div className="text-sm">
                <div className="font-medium">
                    {m.User?.displayName || m.User?.email || `User ${m.userId}`}
                </div>
                <div className="text-gray-500">{m.User?.email}</div>
                </div>
                <div className="flex items-center gap-3">
                    <select
                    className="border p-2 rounded"
                    value={m.role}
                    onChange={(e) => updateMemberRole(m.id, e.target.value)}
                    disabled={m.role === "owner"}
                    >
                    {ROLE_OPTIONS.map((r) => (
                        <option key={r.value} value={r.value}>
                        {r.label}
                        </option>
                    ))}
                    </select>

                    <button
                    className="border px-3 py-1 rounded"
                    onClick={() => removeMember(m.id)}
                    disabled={m.role === "owner"}
                    >
                        Retirer
                    </button>
                </div>
            </div>
            ))}
            {members.length === 0 && (
            <div className="text-sm text-gray-500">Aucun membre listé.</div>
            )}
        </div>

        <form
            onSubmit={addMember}
            className="space-y-2 border p-3 rounded w-full max-w-md"
        >
            <h4 className="font-semibold">Ajouter un membre</h4>
            <input
            className="w-full border p-2 rounded"
            placeholder="Email de l’utilisateur"
            value={newMember.email}
            onChange={(e) =>
                setNewMember({ ...newMember, email: e.target.value })
            }
            />
            <select
            className="w-full border p-2 rounded"
            value={newMember.role}
            onChange={(e) =>
                setNewMember({ ...newMember, role: e.target.value })
            }
            >
            {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                {r.label}
                </option>
            ))}
            </select>
            <button className="px-4 py-2 border rounded">Ajouter</button>
        </form>
      </section>
      {/* CHAT */}
      <section className="mt-10 border-t pt-6">
        <h3 className="font-semibold mb-3">Discussion</h3>

        <div className="h-64 overflow-y-auto border p-3 rounded mb-3 bg-gray-50">
            {messages.map((m) => (
                <div key={m.id} className="mb-2">
                <span className="font-medium">
                    {m.User?.displayName || m.User?.email || m.userId} :
                </span>{" "}
                <span>{m.content}</span>
                </div>
            ))}
            {messages.length === 0 && (
                <div className="text-sm text-gray-500">Aucun message pour l’instant.</div>
            )}
        </div>


        <form onSubmit={sendMessage} className="flex gap-2">
            <input
            className="flex-1 border p-2 rounded"
            placeholder="Écrire un message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            />
            <button className="px-4 py-2 border rounded">Envoyer</button>
        </form>
      </section>
    </div>
  );
}
