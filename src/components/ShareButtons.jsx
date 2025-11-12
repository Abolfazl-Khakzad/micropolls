import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

import { FaTelegramPlane, FaWhatsapp, FaCopy, FaQrcode } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { QRCodeCanvas } from "qrcode.react";
import copy from "copy-to-clipboard";
import toast from "react-hot-toast";

export default function ShareButtons({ pollId }) {
  const [showQR, setShowQR] = useState(false);
  const [shortLink, setShortLink] = useState(null);

  const pollLink = `${window.location.origin}/poll?id=${pollId}`;

  useEffect(() => {
    const fetchShort = async () => {
      const q = query(collection(db, "shortlinks"), where("pollId", "==", pollId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const shortId = snap.docs[0].id;
        setShortLink(`${window.location.origin}/p/${shortId}`);
      }
    };
    fetchShort();
  }, [pollId]);

  const finalLink = shortLink || pollLink;

  const handleCopy = () => {
    copy(finalLink);
    toast.success("Copied!");
  };

  const encoded = encodeURIComponent(finalLink);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-4 text-2xl">
        <a href={`https://x.com/intent/tweet?url=${encoded}`} target="_blank"><FaXTwitter /></a>
        <a href={`https://t.me/share/url?url=${encoded}`} target="_blank"><FaTelegramPlane /></a>
        <a href={`https://api.whatsapp.com/send?text=${encoded}`} target="_blank"><FaWhatsapp /></a>
        <button onClick={handleCopy}><FaCopy /></button>
        <button onClick={() => setShowQR(!showQR)}><FaQrcode /></button>
      </div>

      {showQR && <QRCodeCanvas value={finalLink} size={150} />}
    </div>
  );
}
