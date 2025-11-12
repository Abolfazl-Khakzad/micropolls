import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/", // ✅ مسیر پایه برای هاست‌های استاتیک (خیلی مهم برای Vercel/Netlify)
  build: {
    outDir: "dist", // پیش‌فرض خودش هست ولی شفاف‌تره
  },
});
