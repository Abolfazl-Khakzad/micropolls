import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useEffect } from "react";

export default function ShortLinkRedirect() {
  const { shortId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const go = async () => {
      const ref = doc(db, "shortlinks", shortId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const { pollId } = snap.data();
        navigate(`/poll?id=${pollId}`, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    };
    go();
  }, [shortId, navigate]);

  return (
    <div className="text-center mt-10 text-gray-600">
      Redirecting...
    </div>
  );
}
