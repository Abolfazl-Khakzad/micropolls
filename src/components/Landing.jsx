import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import useSEO from "../hooks/useSEO";

export default function Landing() {
  useSEO({
  title: "Micropolls — Create Instant Polls",
  description: "Create polls instantly. Share anywhere. See real-time results."
});
  const navigate = useNavigate();
  const [user, setUser] = useState(undefined);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u || null));
    return () => unsub();
  }, []);

  const handleProtectedClick = (path) => {
    if (!user) {
      setShowModal(true);
      return;
    }
    navigate(path);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white text-center px-6 py-12">

      {/* Brand Title */}
      <motion.h1
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-5xl md:text-6xl font-extrabold text-gray-900 drop-shadow-sm"
      >
        Micropolls
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
        className="text-gray-600 mt-3 text-lg max-w-md"
      >
        Create polls instantly. Share anywhere. See real-time results.
      </motion.p>

      {/* Decorative animated element */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="mt-12 mb-10 w-full max-w-md mx-auto rounded-3xl shadow-2xl bg-white p-10 relative overflow-hidden"
      >
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
          className="absolute -inset-10 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 opacity-20 blur-3xl"
        />
        <p className="relative text-gray-700 font-medium text-lg">
          Ask. Vote. See results.
        </p>
      </motion.div>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.7 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <button
          onClick={() => handleProtectedClick("/create")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-md hover:shadow-lg transition-all"
        >
          Create Poll
        </button>

        <button
          onClick={() => handleProtectedClick("/discover")}
          className="bg-white border border-blue-600 text-blue-600 px-8 py-3 rounded-xl text-lg font-semibold shadow-md hover:bg-blue-50 transition-all"
        >
          Discover Polls
        </button>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.7 }}
        className="mt-14 text-sm text-gray-500"
      >
        © {new Date().getFullYear()} Micropolls
      </motion.p>

      {/* ✅ Login Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm text-center">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Login Required</h3>
            <p className="text-gray-600 mb-6">You need to sign in before continuing.</p>

            <button
  onClick={async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setShowModal(false); // مدال بسته شه
      navigate("/create"); // یا بفرست جایی که میخوای بعد لاگین بره
    } catch (err) {
      console.log(err);
    }
  }}
  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg w-full transition"
>
  Login with Google
</button>


            <button
              onClick={() => setShowModal(false)}
              className="mt-3 text-gray-500 hover:text-gray-700 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
