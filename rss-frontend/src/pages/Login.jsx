import { useState } from "react";
import api from "../lib/axios";
import { useAuthCtx } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuthCtx();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      // on s’aligne sur ce que renvoie ton backend : { token, user }
      login(data.token, data.user);
      window.location.href = "/";
    } catch (e) {
      setErr(e.response?.data?.message || "Erreur de connexion");
    }
  };

  return (
    <div className="min-h-screen grid place-items-center">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 border p-6 rounded">
        <h1 className="text-xl font-semibold">Connexion</h1>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <input
          className="w-full border p-2 rounded"
          placeholder="Email"
          value={email} onChange={e=>setEmail(e.target.value)}
        />
        <input
          className="w-full border p-2 rounded"
          type="password" placeholder="Mot de passe"
          value={password} onChange={e=>setPassword(e.target.value)}
        />
        <button className="w-full border p-2 rounded" type="submit">Se connecter</button>
      </form>
      <a href="http://localhost:3000/api/auth/google"
         className="px-4 py-2 bg-red-500 text-white rounded">
            Se connecter avec Google
      </a>
    </div>
  );
}
