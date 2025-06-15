import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dotenv from "dotenv";

// Load .env file into process.env
dotenv.config();

// Log the environment variable to see if it's loaded
console.log("✅ VITE_BACKEND_URL in config:", process.env.VITE_BACKEND_URL);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_BACKEND_URL, // ✅ use process.env here
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
