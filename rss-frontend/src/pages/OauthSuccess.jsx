import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthCtx } from "../context/AuthContext";
import api from "../lib/axios";

export default function OauthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuthCtx();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // Stocker le token et récupérer le profil utilisateur
      (async () => {
        try {
          // Sauvegarder le token dans Axios
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // Charger le profil utilisateur
          const { data: user } = await api.get("/api/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          });

          // ⚡ Mettre à jour AuthContext
          login(token, user);

          // Rediriger vers la page principale
          navigate("/collections");
        } catch (err) {
          console.error("Erreur lors du chargement du profil après OAuth", err);
          navigate("/login");
        }
      })();
    } else {
      navigate("/login");
    }
  }, [navigate, searchParams, login]);

  return <p>Connexion en cours...</p>;
}
