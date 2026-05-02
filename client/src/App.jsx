import { LogOut, MessageSquare, PackageCheck, ShieldCheck, ShoppingBag, Star } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectAuth } from "./store/authSlice.js";

const navLink = ({ isActive }) =>
  `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
    isActive ? "bg-ink text-white" : "text-slate-700 hover:bg-slate-100"
  }`;

export default function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(selectAuth);

  function handleLogout() {
    dispatch(logout());
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-lg font-black text-ink">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-mint text-white">
              <ShieldCheck size={22} />
            </span>
            TrustBazaar
          </Link>

          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/" className={navLink}>
              <ShoppingBag size={16} /> Marketplace
            </NavLink>
            <NavLink to="/orders" className={navLink}>
              <PackageCheck size={16} /> Orders
            </NavLink>
            {user ? (
              <>
                <span className="hidden items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 sm:inline-flex">
                  <Star size={15} className="text-amber" /> {user.name}
                </span>
                <button onClick={handleLogout} className="focus-ring inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <NavLink to="/login" className={navLink}>
                <MessageSquare size={16} /> Login
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

