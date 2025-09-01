import { Navigate, Outlet } from "react-router-dom";
import { useAuthCtx } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { isAuth } = useAuthCtx();
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
}
