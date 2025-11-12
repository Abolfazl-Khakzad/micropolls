import { useEffect, useState } from "react";
import { auth, provider } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";

export default function AuthButton() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsub();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="flex items-center gap-3">
      {user ? (
        <>
          <span className="text-sm text-gray-700">
            👋 {user.displayName || user.email}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
          >
            Logout
          </button>
        </>
      ) : (
        <button
          onClick={handleLogin}
          className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
        >
          Login with Google
        </button>
      )}
    </div>
  );
}
