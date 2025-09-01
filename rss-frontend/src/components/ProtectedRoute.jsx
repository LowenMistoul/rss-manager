import { Navigate, Outlet } from "react-router-dom";
import { useAuthCtx } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { isAuth, loading } = useAuthCtx();

  if (loading) {
    return <div className="p-4">Chargement...</div>; // éviter redirection trop tôt
  }

  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
}
