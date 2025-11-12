import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc} from "firebase/firestore";
import { db } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import useSEO from "../hooks/useSEO";

export default function PollView({ embedId = null }) {
  
  const [poll, setPoll] = useState(null);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [pollEnded, setPollEnded] = useState(false);

  const pollId = embedId || new URLSearchParams(window.location.search).get("id");
useSEO({
  title: poll ? poll.question : "Loading Poll...",
  description: "Vote and see real-time poll results."
});
  useEffect(() => {
    if (!pollId) return;

    const unsubscribe = onSnapshot(doc(db, "polls", pollId), (pollDoc) => {
      if (pollDoc.exists()) {
        const data = pollDoc.data();
        setPoll({ id: pollDoc.id, ...data });

        // اگر کاربر قبلاً رأی داده، گزینه‌اش را بخوان
        const voteKey = `vote_${pollDoc.id}`;
        const storedVote = localStorage.getItem(voteKey);
        if (storedVote !== null) setSelected(parseInt(storedVote));
      } else {
        toast.error("Poll not found!");
      }
    });

    return () => unsubscribe();
  }, [pollId]);

  useEffect(() => {
    if (!poll?.expiresAt) return;

    const interval = setInterval(() => {
      const diff =
        poll.expiresAt.toMillis?.() !== undefined
          ? poll.expiresAt.toMillis() - Date.now()
          : poll.expiresAt - Date.now();

      if (diff <= 0) {
        setTimeLeft(0);
        setPollEnded(true);
        clearInterval(interval);
      } else {
        setTimeLeft(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [poll]);

  // ✅ رأی با قابلیت تغییر
  const handleVote = async (index) => {
    if (!poll) return;

    const now =
      poll.expiresAt.toMillis?.() !== undefined
        ? poll.expiresAt.toMillis()
        : poll.expiresAt;

    if (now < Date.now()) {
      toast.error("This poll has ended.");
      return;
    }

    const voteKey = `vote_${poll.id}`;
    const previousVote = localStorage.getItem(voteKey);

    const updatedOptions = poll.options.map((opt, i) => {
      let votes = opt.votes;
      // اگه کاربر قبلاً رأی داده بود، از گزینه‌ی قبلی یه رأی کم کن
      if (previousVote !== null && parseInt(previousVote) === i) votes -= 1;
      // به گزینه‌ی جدید رأی اضافه کن
      if (i === index) votes += 1;
      return { ...opt, votes };
    });

    await updateDoc(doc(db, "polls", poll.id), { options: updatedOptions });

    // ذخیره‌ی رأی فعلی در localStorage
    localStorage.setItem(voteKey, index);
    setSelected(index);
    toast.success("Your vote has been updated!");
  };

 

  if (!pollId)
    return <p className="text-center mt-20 text-gray-500">No poll ID provided.</p>;

  if (!poll)
    return <p className="text-center mt-20 text-gray-500">Loading...</p>;

  const formatTime = (ms) => {
    if (ms <= 0) return "⏰ Poll ended";
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((ms % (60 * 1000)) / 1000);
    return `⏳ Time left: ${
      days > 0 ? `${days}d ` : ""
    }${hours > 0 ? `${hours}h ` : ""}${minutes}m ${seconds}s`;
  };

  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);

  return (
  <div
    className={`${
      embedId ? "bg-transparent min-h-0" : "min-h-screen bg-[#f4f6fb]"
    } flex flex-col items-center justify-center px-4 py-8`}
  >
    <div className="bg-white rounded-2xl shadow p-5 sm:p-6 w-full max-w-md transition-all duration-500">
      
      <h2 className="text-xl sm:text-2xl font-bold mb-5 text-center break-words leading-snug">
        {poll.question}
      </h2>

      {timeLeft !== null && (
        <p
          className={`text-center text-xs sm:text-sm font-medium mb-4 ${
            pollEnded ? "text-red-600" : "text-gray-600"
          }`}
        >
          {formatTime(timeLeft)}
        </p>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key="voting"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-2"
        >
          {poll.options.map((opt, i) => {
            const percent = totalVotes
              ? ((opt.votes / totalVotes) * 100).toFixed(1)
              : 0;

            return (
              <button
                key={i}
                onClick={() => handleVote(i)}
                disabled={pollEnded}
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 sm:py-3 transition text-left ${
                  selected === i ? "bg-blue-500 text-white" : "bg-white hover:bg-blue-50"
                }`}
              >
                <div className="flex justify-between">
                  <span className="truncate max-w-[70%]">{opt.text}</span>
                  <span className="text-xs sm:text-sm opacity-70">{percent}%</span>
                </div>
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      <p className="text-center mt-5 text-xs sm:text-sm text-gray-600">
        Total votes:{" "}
        <span className="font-medium text-gray-800">{totalVotes}</span>
      </p>
    </div>
  </div>
);
}
