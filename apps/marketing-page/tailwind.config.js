// apps/marketing-page/tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        // Mapped from uiManager.css
        "theme-bg": "var(--bg-color)",
        "theme-panel": "var(--panel-bg-color)",
        "theme-border": "var(--border-color)",
        "theme-text-primary": "var(--text-primary)",
        "theme-text-secondary": "var(--text-secondary)",
        "theme-accent": "var(--accent-color)",
        "theme-accent-hover": "#6b72e8", // A slightly darker shade for hover
        "theme-error": "var(--error-color)",
      },
    },
  },
  plugins: [],
};
