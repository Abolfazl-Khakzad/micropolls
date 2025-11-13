import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import prerender from "vite-plugin-prerender"

export default defineConfig({
  plugins: [
    react(),
    prerender({
      routes: [
        "/", 
        "/create", 
        "/discover"
      ]
    })
  ],
  base: "/", // ✅ مسیر پایه برای هاست‌های استاتیک (خیلی مهم برای Vercel/Netlify)
  build: {
    outDir: "dist", // پیش‌فرض خودش هست ولی شفاف‌تره
  },
});
