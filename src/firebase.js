// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔹 پیکربندی مخصوص پروژه‌ی خودت
const firebaseConfig = {
  apiKey: "AIzaSyDTQ-gWR9ZnxqGshW6JeSoEqg4VMu1JzEI",
  authDomain: "micropolls.firebaseapp.com",
  projectId: "micropolls",
  storageBucket: "micropolls.appspot.com",
  messagingSenderId: "979076227856",
  appId: "1:979076227856:web:507cdb70827e818902fb95"
};

// ✅ اول برنامه فایربیس رو راه بنداز
const app = initializeApp(firebaseConfig);

// ✅ بعد سرویس‌ها رو بساز
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ اینجا provider برای ورود با گوگل ساخته میشه
const provider = new GoogleAuthProvider();

export { app, auth, db, provider };
