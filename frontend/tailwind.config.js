/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        shtab: {
          dark: '#0f172a',      // Dark sidebar
          sidebar: '#1e293b',   // Darker panel
          accent: '#6366f1',    // Indigo / purple accent
          accentHover: '#4f46e5',
          light: '#f8fafc',     // Main background
          card: '#ffffff',
          border: '#e2e8f0',
          text: '#1e293b',
          muted: '#64748b'
        }
      }
    },
  },
  plugins: [],
}
