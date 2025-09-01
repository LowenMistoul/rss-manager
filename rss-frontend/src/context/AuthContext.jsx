import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // au chargement, si token présent → tente /api/users/me
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    (async () => {
      try {
        const { data } = await api.get("/api/users/me");
        setUser(data);
      } catch {
        localStorage.removeItem("token");
        setUser(null);
      }
    })();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData || null);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, isAuth: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthCtx = () => useContext(AuthContext);
