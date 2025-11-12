import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ShareButtons from "./ShareButtons";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";
import useSEO from "../hooks/useSEO";

export default function CreatePoll() {
  useSEO({
    title: "Create a Poll — Micropolls",
    description: "Create a new poll and share it instantly with your audience."
  });
  const [user, setUser] = useState(null);
  const [pollId, setPollId] = useState(null);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [pollLink, setPollLink] = useState(null);
  const [durationValue, setDurationValue] = useState(60);
  const [durationUnit, setDurationUnit] = useState("minutes");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [shortLink, setShortLink] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) {
        toast.error("Please log in to create a poll.");
        window.location.href = "/";
      } else {
        setUser(u);
      }
    });
    return () => unsubscribe();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <p>Checking login status...</p>
      </div>
    );
  }

  const handleCreatePoll = async () => {
    if (!question.trim() || options.filter((o) => o.trim()).length < 2) {
      toast.error("Enter a question and at least 2 valid options.");
      return;
    }

    setIsLoading(true);

    let durationMs = 0;
    if (durationUnit === "minutes") durationMs = durationValue * 60 * 1000;
    else if (durationUnit === "hours") durationMs = durationValue * 60 * 60 * 1000;
    else if (durationUnit === "days") durationMs = durationValue * 24 * 60 * 60 * 1000;

    const pollData = {
      question,
      options: options
        .filter((o) => o.trim())
        .map((o) => ({ text: o, votes: 0 })),
      createdAt: Date.now(),
      expiresAt: Date.now() + durationMs,
      creatorId: user.uid,
    };

    try {
      const docRef = await addDoc(collection(db, "polls"), pollData);
      await setDoc(doc(db, "users", user.uid, "myPolls", docRef.id), {
        question,
        createdAt: Date.now(),
      });
      localStorage.setItem("micropolls_user_id", user.uid);
      setPollId(docRef.id);
      const link = `${window.location.origin}/poll?id=${docRef.id}`;
      setPollLink(link);
      const shortId = Math.random().toString(36).slice(2, 8).toUpperCase(); // 6 کاراکتر
      await setDoc(doc(db, "shortlinks", shortId), {
      pollId: docRef.id,
      owner: user.uid,
      createdAt: Date.now(),
      });
      setShortLink(`${window.location.origin}/p/${shortId}`);
      toast.success("Poll created successfully!");
    } catch (error) {
      console.error("Error creating poll:", error);
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-6">
    <div className="bg-white rounded-2xl shadow p-6 w-full max-w-lg sm:max-w-md">

      {!pollLink ? (
        <>
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Create a Poll
          </h2>

          <input
            type="text"
            placeholder="Enter your question"
            className="w-full border border-gray-300 rounded-lg p-3 mb-4 text-sm"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          {options.map((opt, i) => (
            <input
              key={i}
              type="text"
              placeholder={`Option ${i + 1}`}
              className="w-full border border-gray-300 rounded-lg p-3 mb-3 text-sm"
              value={opt}
              onChange={(e) => {
                const newOptions = [...options];
                newOptions[i] = e.target.value;
                setOptions(newOptions);
              }}
            />
          ))}

          {options.length < 6 && (
            <button
              onClick={() => setOptions([...options, ""])}
              className="text-blue-600 text-xs mb-4 underline"
            >
              + Add option
            </button>
          )}

          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Duration
            </label>
            <div className="flex gap-2 w-full">
              <input
                type="number"
                min="1"
                value={durationValue}
                onChange={(e) => setDurationValue(e.target.value)}
                className="flex-1 border border-gray-300 bg-white rounded-lg p-2 text-sm"
              />
              <select
                value={durationUnit}
                onChange={(e) => setDurationUnit(e.target.value)}
                className="w-1/3 border border-gray-300 bg-white rounded-lg p-2 text-sm"
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleCreatePoll}
            disabled={isLoading}
            className={`w-full text-white rounded-lg p-3 text-sm transition ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Creating..." : "Create Poll"}
          </button>
        </>
      ) : (
        <div className="text-center">
          <p className="text-green-700 font-medium mb-3">
            ✅ Poll created successfully!
          </p>

          <a
            href={pollLink}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline break-all block mb-5"
          >
            {pollLink}
          </a>

          {pollId && (
            <div className="flex justify-center mb-6">
              <ShareButtons pollId={pollId} shortLink={shortLink} />
            </div>
          )}
          {shortLink && (
      <div className="mt-3">
    <p className="text-gray-700 text-sm mb-1 font-medium">Short link:</p>
    <div className="flex items-center gap-2 justify-center">
      <a
        href={shortLink}
        target="_blank"
        rel="noreferrer"
        className="text-blue-600 underline break-all"
      >
        {shortLink}
      </a>
      <button
        onClick={() => {
          navigator.clipboard.writeText(shortLink);
          toast.success("Short link copied!");
        }}
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs py-1 px-2 rounded"
     >
        Copy
      </button>
    </div>
  </div>
)}
          <button
            onClick={() => navigate(`/poll?id=${pollId}`)}
            className="bg-blue-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-600 mb-6"
          >
            Open Poll
          </button>

          {pollId && (
            <div className="mt-4 border-t pt-4">
              <p className="text-gray-700 text-sm mb-2 font-medium">
                Embed in your website:
              </p>
              <textarea
                readOnly
                className="w-full border text-xs rounded-lg p-2 bg-gray-50 text-gray-600"
                value={`<iframe src="${window.location.origin}/embed?id=${pollId}" width="100%" height="300" frameborder="0"></iframe>`}
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `<iframe src="${window.location.origin}/embed?id=${pollId}" width="100%" height="300" frameborder="0"></iframe>`
                  );
                  toast.success("Embed code copied to clipboard!");
                }}
                className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm py-1 px-3 rounded-lg"
              >
                Copy Embed Code
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);
}
