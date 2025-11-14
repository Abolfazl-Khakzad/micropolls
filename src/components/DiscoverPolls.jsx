import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";
import useSEO from "../hooks/useSEO";
import { where } from "firebase/firestore";

export default function DiscoverPolls() {
  useSEO({
    title: "Discover Polls — Micropolls",
    description: "Browse public polls and see trending community votes."
  });

  const [polls, setPolls] = useState([]);
  const [editingPoll, setEditingPoll] = useState(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editOptions, setEditOptions] = useState([]);
  const [linkModal, setLinkModal] = useState(null);
  const [user, setUser] = useState(undefined);

  // 🔒 Login check
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
      else setUser(null);
    });
    return () => unsub();
  }, []);

  // 🔹 Real-time polls listener
  useEffect(() => {
    if (!user) return;

    const q = query(
  collection(db, "polls"),
  where("creatorId", "==", user.uid),
  orderBy("createdAt", "desc")
);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded = snapshot.docs.map((doc) => {
        const data = doc.data();
        const expiresAt = data.expiresAt?.toMillis?.()
          ? data.expiresAt.toMillis()
          : data.expiresAt;
        const expired = expiresAt <= Date.now();
        return { id: doc.id, ...data, expired };
      });
      setPolls(loaded);
    });

    return () => unsubscribe();
  }, [user]);

  // 🔁 Local timer every 5s to update expiry
  useEffect(() => {
    if (!polls.length) return;
    const interval = setInterval(() => {
      setPolls((prev) =>
        prev.map((p) => {
          const expiresAt = p.expiresAt?.toMillis?.()
            ? p.expiresAt.toMillis()
            : p.expiresAt;
          return { ...p, expired: expiresAt <= Date.now() };
        })
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [polls]);

  if (user === undefined)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Checking login status...
      </div>
    );

  if (user === null)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        <div className="text-center">
          <p className="mb-3">You must log in to view polls.</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );

  const handleDelete = async (pollId) => {
  const poll = polls.find((p) => p.id === pollId);
  if (!poll) return;

  if (poll.creatorId !== user.uid) {
    toast.error("You are not allowed to delete this poll.");
    return;
  }

  if (window.confirm("Are you sure you want to delete this poll?")) {
    try {
      await deleteDoc(doc(db, "polls", pollId));
      toast.success("Poll deleted successfully!");
    } catch (err) {
      console.error("Error deleting poll:", err);
      toast.error("Error deleting poll!");
    }
  }
};


  const openEditModal = (poll) => {
    setEditingPoll(poll);
    setEditQuestion(poll.question);
    setEditOptions(poll.options.map((opt) => opt.text));
  };

  const saveEdit = async () => {
  if (!editingPoll || editingPoll.creatorId !== user.uid) {
    toast.error("You are not allowed to edit this poll.");
    return;
  }

  try {
    const updatedOptions = editOptions.map((text, i) => ({
      ...editingPoll.options[i],
      text,
    }));

    await updateDoc(doc(db, "polls", editingPoll.id), {
      question: editQuestion,
      options: updatedOptions,
    });

    setEditingPoll(null);
    toast.success("Poll updated successfully!");
  } catch (err) {
    console.error("Error editing poll:", err);
    toast.error("Error updating poll!");
  }
};


  if (polls.length === 0)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F9FC] text-gray-700">
        <p>No polls yet. Create one first!</p>
      </div>
    );

 return (
  <div className="min-h-screen w-full flex flex-col items-center py-8 px-4 bg-[#F7F9FC] text-gray-800">
    <div className="w-full max-w-lg bg-white p-5 sm:p-6 rounded-2xl shadow">
      <h2 className="text-xl sm:text-2xl font-semibold mb-5 text-center">
        All Polls
      </h2>

      <div className="space-y-4">
        {polls.map((poll) => {
          const totalVotes = poll.options?.reduce((a, b) => a + b.votes, 0) || 0;
          const isEnded = poll.expired;
          const isOwner = poll.creatorId === user.uid;

          return (
            <div
              key={poll.id}
              className={`border rounded-xl p-4 transition ${
                isEnded
                  ? "bg-gray-100 opacity-80"
                  : "bg-[#F7F9FC] hover:bg-gray-50"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-2">
                <p className="font-medium text-base sm:text-lg">{poll.question}</p>
                <span
                  className={`text-xs px-2 py-1 rounded self-start sm:self-center ${
                    isEnded
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {isEnded ? "Ended" : "Ongoing"}
                </span>
              </div>

              {poll.options?.map((opt, i) => {
                const percent =
                  totalVotes > 0
                    ? Math.round((opt.votes / totalVotes) * 100)
                    : 0;

                return (
                  <div key={i} className="mb-2">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span className="truncate max-w-[70%]">{opt.text}</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="h-2 bg-blue-500 rounded-full transition-all duration-700"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 gap-3">

  <p className="text-xs text-gray-500">
    Total votes:
    <span className="font-medium text-gray-700"> {totalVotes}</span>
  </p>

  <div className="flex flex-wrap gap-2 justify-center sm:justify-end">

    <button
      onClick={() => setLinkModal(poll.id)}
      className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
    >
      View Link
    </button>
<button
  onClick={() => {
    const embedCode = `<iframe src="${window.location.origin}/embed?id=${poll.id}" width="100%" height="300" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    toast.success("Embed code copied!");
  }}
  className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 py-1 rounded"
>
  Copy Embed
</button>

    {/* ✅ دکمه‌های اشتراک (همیشه نمایش داده می‌شن) */}
    <button
      onClick={() =>
        window.open(
          `https://x.com/intent/tweet?text=${encodeURIComponent(
            `Vote or View Results: ${poll.question}`
          )}&url=${encodeURIComponent(`${window.location.origin}/poll?id=${poll.id}`)}`,
          "_blank"
        )
      }
      className="text-xs px-2 py-1 rounded bg-black text-white"
    >
      Share X
    </button>

    <button
      onClick={() =>
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(
            `${window.location.origin}/poll?id=${poll.id}`
          )}&text=${encodeURIComponent(`Vote or View Results: ${poll.question}`)}`,
          "_blank"
        )
      }
      className="text-xs px-2 py-1 rounded bg-blue-500 text-white"
    >
      Telegram
    </button>

    <button
      onClick={() =>
        window.open(
          `https://api.whatsapp.com/send?text=${encodeURIComponent(
            `Vote or View Results: ${poll.question} → ${window.location.origin}/poll?id=${poll.id}`
          )}`,
          "_blank"
        )
      }
      className="text-xs px-2 py-1 rounded bg-green-500 text-white"
    >
      WhatsApp
    </button>

    {/* ✅ فقط وقتی پول بازه → این دو تا دکمه نمایش داده می‌شن */}
    {isOwner && !isEnded && (
      <>
        <button
          onClick={() => openEditModal(poll)}
          className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2 py-1 rounded"
        >
          Edit
        </button>

        <button
          onClick={() => handleDelete(poll.id)}
          className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded"
        >
          Delete
        </button>
      </>
    )}

  </div>
</div>


            </div>
          );
        })}
      </div>
    </div>

    {/* Edit Modal */}
    {editingPoll && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center px-4 z-50">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6 relative">
          <h3 className="text-lg font-semibold mb-3 text-center">Edit Poll</h3>
          <input
            type="text"
            value={editQuestion}
            onChange={(e) => setEditQuestion(e.target.value)}
            className="w-full border rounded-lg p-2 mb-3"
            placeholder="Edit question"
          />
          {editOptions.map((opt, i) => (
            <input
              key={i}
              type="text"
              value={opt}
              onChange={(e) => {
                const newOpts = [...editOptions];
                newOpts[i] = e.target.value;
                setEditOptions(newOpts);
              }}
              className="w-full border rounded-lg p-2 mb-2"
              placeholder={`Option ${i + 1}`}
            />
          ))}
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setEditingPoll(null)}
              className="px-4 py-2 text-sm rounded-lg bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={saveEdit}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Link Modal */}
    {linkModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center px-4 z-50">
        <div className="bg-white rounded-2xl shadow-lg p-5 w-full max-w-md text-center relative">
          <button
            onClick={() => setLinkModal(null)}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
          <p className="text-lg font-semibold mb-3">Poll Link</p>
          <a
            href={`${window.location.origin}/poll?id=${linkModal}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline break-all"
          >
            {`${window.location.origin}/poll?id=${linkModal}`}
          </a>
          <button
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/poll?id=${linkModal}`
              );
              toast.success("Link copied!");
            }}
            className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm py-1 px-3 rounded-lg"
          >
            Copy Link
          </button>
        </div>
      </div>
    )}
  </div>
);

}
