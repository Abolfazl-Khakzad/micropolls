import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

import CreatePoll from "./components/CreatePoll";
import DiscoverPolls from "./components/DiscoverPolls";
import AuthButton from "./components/AuthButton";
import PollView from "./components/PollView";
import Landing from "./components/Landing";
import EmbedPoll from "./components/EmbedPoll";
import ShortLinkRedirect from "./components/ShortLinkRedirect";

// ---------- Protected Route ----------
function ProtectedRoute({ user, children }) {
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Checking login status...
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace />;
  return children;
}

// ---------- Layout with Navbar ----------
function Layout({ user, onLogout, menuOpen, setMenuOpen, isLoggingOut }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] text-gray-800">
      <nav className="bg-white shadow px-4 sm:px-6 py-3 flex justify-between items-center relative">
        <a href="/" className="font-semibold text-lg text-blue-600">
          Micropolls
        </a>

        <button
          className="md:hidden text-gray-700 text-2xl focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        <div className="hidden md:flex gap-4 items-center">
          {user && (
            <>
              <a
                href="/create"
                className="text-sm text-blue-700 hover:text-blue-900"
              >
                Create
              </a>
              <a
                href="/discover"
                className="text-sm text-blue-700 hover:text-blue-900"
              >
                Discover
              </a>
            </>
          )}

          {user ? (
            <button
              onClick={onLogout}
              disabled={isLoggingOut}
              className={`text-sm border rounded-lg px-3 py-1 transition ${
                isLoggingOut
                  ? "text-gray-400 border-gray-300 cursor-not-allowed"
                  : "text-red-600 border-red-400 hover:text-red-800"
              }`}
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          ) : (
            <AuthButton />
          )}
        </div>

        {menuOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-md flex flex-col items-start p-4 gap-2 md:hidden z-50">
            {user && (
              <>
                <a
                  href="/create"
                  className="w-full text-blue-700 hover:bg-blue-50 rounded px-2 py-1"
                  onClick={() => setMenuOpen(false)}
                >
                  Create
                </a>
                <a
                  href="/discover"
                  className="w-full text-blue-700 hover:bg-blue-50 rounded px-2 py-1"
                  onClick={() => setMenuOpen(false)}
                >
                  Discover
                </a>
              </>
            )}
            {user ? (
              <button
                onClick={onLogout}
                disabled={isLoggingOut}
                className={`w-full text-left text-sm border rounded-lg px-2 py-1 transition ${
                  isLoggingOut
                    ? "text-gray-400 border-gray-300 cursor-not-allowed"
                    : "text-red-600 border-red-400 hover:text-red-800"
                }`}
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            ) : (
              <AuthButton />
            )}
          </div>
        )}
      </nav>

      <div className="flex-1 px-3 sm:px-6 py-4 flex justify-center">
        <Outlet />
      </div>
    </div>
  );
}

// ---------- Main App ----------
export default function App() {
  const [user, setUser] = useState(undefined);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setIsLoggingOut(false);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut(auth);
    window.location.href = "/";
  };

  return (
    <Router>
      <Routes>
        {/* ---------- PUBLIC ROUTES ---------- */}
        <Route path="/poll" element={<PollView />} />
        <Route path="/embed" element={<EmbedPoll />} />
        <Route path="/p/:shortId" element={<ShortLinkRedirect />} />

        {/* ---------- LAYOUT ROUTES ---------- */}
        <Route
          element={
            <Layout
              user={user}
              onLogout={handleLogout}
              menuOpen={menuOpen}
              setMenuOpen={setMenuOpen}
              isLoggingOut={isLoggingOut}
            />
          }
        >
          <Route path="/" element={<Landing />} />

          <Route
            path="/create"
            element={
              <ProtectedRoute user={user}>
                <CreatePoll />
              </ProtectedRoute>
            }
          />

          <Route
            path="/discover"
            element={
              <ProtectedRoute user={user}>
                <DiscoverPolls />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}
