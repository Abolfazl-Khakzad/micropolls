import { Link } from "react-router-dom";
import { auth } from "../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("micropolls_user_id");
    window.location.href = "/";
  };

  return (
    <nav className="w-full bg-white shadow-md py-3 px-6 flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="text-xl font-bold text-blue-600">
        Micropolls
      </Link>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-gray-700 text-2xl"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-4">
        {user ? (
          <>
            <Link
              to="/discover"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Discover
            </Link>
            <Link
              to="/create"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Create Poll
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-lg text-sm"
          >
            Login with Google
          </Link>
        )}
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="absolute right-6 top-14 bg-white shadow-lg rounded-lg p-4 flex flex-col gap-3 w-40 md:hidden">
          {user ? (
            <>
              <Link
                to="/discover"
                onClick={() => setMenuOpen(false)}
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Discover
              </Link>
              <Link
                to="/create"
                onClick={() => setMenuOpen(false)}
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Create Poll
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-lg text-sm text-center"
            >
              Login
            </Link>
          )}
          </div>
        )}
    </nav>
  );
}
