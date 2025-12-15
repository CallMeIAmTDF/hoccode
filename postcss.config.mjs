const config = {
  plugins: ["@tailwindcss/postcss"],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {

        primary: {
          DEFAULT: '#2563EB', // Blue-600
          dark: '#1E40AF',   // Blue-800
        },
        accent: {
          DEFAULT: '#10B981', // Emerald-600
          light: '#34D399',  // Emerald-400
        },
        background: {
          DEFAULT: '#F9FAFB', // Gray-50
          light: '#F3F4F6',   // Gray-100
        },
        text: {
          DEFAULT: '#374151', // Gray-700
          light: '#6B7280',   // Gray-500
        },
        highlight: '#FBBF24', // Amber-400
      },
    },
  },
};

export default config;
