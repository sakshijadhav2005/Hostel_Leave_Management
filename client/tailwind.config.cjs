/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        status: {
          pending: {
            DEFAULT: "#d97706", // amber-600
            fg: "#0b0b0b",
          },
          approved: {
            DEFAULT: "#059669", // emerald-600
            fg: "#ffffff",
          },
          rejected: {
            DEFAULT: "#e11d48", // rose-600
            fg: "#ffffff",
          },
          out: {
            DEFAULT: "#ea580c", // orange-600
            fg: "#ffffff",
          },
          returned: {
            DEFAULT: "#2563eb", // blue-600
            fg: "#ffffff",
          },
        },
      },
      spacing: {
        phi1: "1rem",
        phi2: "1.618rem",
        phi3: "2.618rem",
        phi4: "4.236rem",
      },
    },
  },
  plugins: [],
};
