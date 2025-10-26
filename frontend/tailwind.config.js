// tailwind.config.js
import flowbite from "flowbite-react/tailwind";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    flowbite.content(),
  ],
  theme: {
    extend: {
      fontFamily: {
        sometypeRegular: ["SometypeMono Regular", "monospace"],
      },
      screens: {
        mbmini: "290px",
        mbxsmall: "400px",
        mbmedsmall: "500px",
        mbsmall: "600px",
        mbmedium: "800px",
        carousel: "932px",
        laptop: "1000px",
        tbportrait: "1200px",  
        tbmedium: "1400px",
        tblandscape: "1600px",
        desktop: "2000px",
        lgdesktop: "2400px",
      },
    },
  },
  plugins: [flowbite.plugin()],
};
