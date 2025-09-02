import { Outlet, Link } from "react-router-dom";
import { useAuthCtx } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

export default function Shell() {
  const { user, logout } = useAuthCtx();
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r p-4 space-y-3">
        <div className="font-bold text-xl">RSS Manager</div>
        {/* <ThemeToggle /> */}
        <nav className="space-y-2">
          <Link to="/" className="block">Accueil</Link>
          <Link to="/collections" className="block">Collections</Link>
          <Link to="/settings" className="block">Paramètres</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-500">Bienvenue</div>
          <div className="flex items-center gap-3">
            <span className="text-sm">{user?.displayName || user?.email}</span>
            <button onClick={logout} className="px-3 py-1 border rounded">Logout</button>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
