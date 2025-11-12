import { ImageResponse } from "@vercel/og";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET({ request }) {
  const { searchParams } = new URL(request.url);
  const pollId = searchParams.get("id");

  const snap = await getDoc(doc(db, "polls", pollId));
  if (!snap.exists()) return new Response("Not found", { status: 404 });

  const poll = snap.data();
  const totalVotes = poll.options.reduce((a, b) => a + b.votes, 0);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "white",
          padding: "50px",
          fontFamily: "sans-serif"
        }}
      >
        <h1 style={{ fontSize: "60px", color: "#2563EB", marginBottom: "20px" }}>
          {poll.question}
        </h1>
        <p style={{ fontSize: "30px", color: "#333" }}>
          {totalVotes} total votes
        </p>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
