// tailwind.config.js
import { defineConfig } from 'tailwindcss';

export default defineConfig({
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sometypeRegular: ["SometypeMono Regular","monospace"],
      },
    },
  },
  plugins: [],
});
