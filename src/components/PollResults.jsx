import { useEffect, useState } from "react";

export default function PollResults() {
  const [poll, setPoll] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) return;
    const saved = localStorage.getItem(`poll_${id}`);
    if (saved) setPoll(JSON.parse(saved));
  }, []);

  if (!poll) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        <p>Poll not found.</p>
      </div>
    );
  }

  const totalVotes = poll.options.reduce((a, b) => a + b.votes, 0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F9FC] text-gray-800 px-4">
      <div className="bg-white shadow rounded-2xl p-6 w-full max-w-lg sm:max-w-md border border-gray-100">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {poll.question}
        </h2>
        {poll.options.map((opt, i) => {
          const percent =
            totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
          return (
            <div key={i} className="mb-3">
              <div className="flex justify-between mb-1">
                <span>{opt.text}</span>
                <span>{percent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 bg-blue-500 rounded-full"
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
            </div>
          );
        })}
        <p className="text-center text-sm text-gray-500 mt-4">
          Total votes: {totalVotes}
        </p>
      </div>
    </div>
  );
}
