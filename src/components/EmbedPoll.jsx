import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function EmbedPoll() {
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("light");
  const [searchParams] = useSearchParams();
  const pollId = searchParams.get("id");

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const docRef = doc(db, "polls", pollId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) setPoll({ id: snapshot.id, ...snapshot.data() });
      } catch (err) {
        console.error("Error loading embedded poll:", err);
      } finally {
        setLoading(false);
      }
    };
    if (pollId) fetchPoll();

    // 🔹 detect system color scheme
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setTheme(mediaQuery.matches ? "dark" : "light");
    mediaQuery.addEventListener("change", (e) =>
      setTheme(e.matches ? "dark" : "light")
    );

    return () => mediaQuery.removeEventListener("change", () => {});
  }, [pollId]);

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${
          theme === "dark" ? "bg-gray-900 text-gray-300" : "bg-[#F7F9FC] text-gray-600"
        }`}
      >
        <p>Loading poll...</p>
      </div>
    );
  }

  if (!poll) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${
          theme === "dark" ? "bg-gray-900 text-gray-300" : "bg-[#F7F9FC] text-gray-600"
        }`}
      >
        <p>Poll not found</p>
      </div>
    );
  }

  const totalVotes = poll.options?.reduce((a, b) => a + b.votes, 0) || 0;

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-colors ${
        theme === "dark" ? "bg-gray-900 text-gray-200" : "bg-[#F7F9FC] text-gray-800"
      }`}
    >
      <div
        className={`w-full max-w-md p-5 rounded-2xl shadow-lg transition-all ${
          theme === "dark"
            ? "bg-gray-800 border border-gray-700"
            : "bg-white border border-gray-200"
        }`}
      >
        <h2 className="text-lg font-semibold mb-4 text-center">{poll.question}</h2>

        {poll.options?.map((opt, i) => {
          const percent =
            totalVotes > 0
              ? Math.round((opt.votes / totalVotes) * 100)
              : 0;
          return (
            <div key={i} className="mb-3">
              <div className="flex justify-between text-xs opacity-80">
                <span>{opt.text}</span>
                <span>{percent}%</span>
              </div>
              <div
                className={`w-full rounded-full h-2 mt-1 ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                }`}
              >
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${
                    theme === "dark" ? "bg-blue-400" : "bg-blue-500"
                  }`}
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
            </div>
          );
        })}

        <p className="text-xs opacity-70 mt-4 text-right">
          Total votes: {totalVotes}
        </p>

        <div className="text-center mt-4">
          <a
            href={`${window.location.origin}/poll?id=${poll.id}`}
            target="_blank"
            rel="noreferrer"
            className={`text-xs font-medium underline ${
              theme === "dark" ? "text-blue-400" : "text-blue-600"
            }`}
          >
            View full poll →
          </a>
        </div>
      </div>
    </div>
  );
}