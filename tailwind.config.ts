import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // Dodajemy obsługę trybu ciemnego poprzez klasę CSS
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        "slow-blob": "blob 15s infinite ease",
        "float": "float 8s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "gradient": "gradient 8s linear infinite",
        "text": "textGradient 3s ease infinite",
        "fade-in": "fadeIn 1s ease-in forwards",
        "fade-in-delay": "fadeIn 1s ease-in 0.3s forwards",
        "fade-in-delay-2": "fadeIn 1s ease-in 0.6s forwards",
        "scroll-down": "scrollDown 2s ease-in-out infinite",
        "shooting-star": "shootingStar 6s linear infinite",
        "button-glow": "buttonGlow 2s ease-in-out infinite",
        "shimmer": "shimmer 3s ease-in-out infinite",
      },
      keyframes: {
        blob: {
          "0%, 100%": {
            transform: "translate(0, 0) scale(1)",
          },
          "25%": {
            transform: "translate(20px, -30px) scale(1.05)",
          },
          "50%": {
            transform: "translate(-20px, 20px) scale(0.95)",
          },
          "75%": {
            transform: "translate(30px, 30px) scale(1.05)",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0) scale(1)",
            opacity: "0.8",
          },
          "50%": {
            transform: "translateY(-15px) scale(1.05)",
            opacity: "0.3",
          },
        },
        gradient: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        textGradient: {
          "0%, 100%": {
            backgroundSize: "200% 200%",
            backgroundPosition: "left center",
          },
          "50%": {
            backgroundSize: "200% 200%",
            backgroundPosition: "right center",
          },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scrollDown: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(10px)" },
        },
        shootingStar: {
          "0%": { 
            transform: "translateX(0) translateY(0) rotate(30deg)",
            opacity: "0" 
          },
          "10%": { 
            opacity: "1" 
          },
          "70%": { 
            opacity: "1" 
          },
          "100%": { 
            transform: "translateX(1000px) translateY(300px) rotate(30deg)",
            opacity: "0" 
          },
        },
        buttonGlow: {
          "0%, 100%": {
            boxShadow: "0 0 5px 2px rgba(124, 58, 237, 0.3)",
          },
          "50%": {
            boxShadow: "0 0 20px 5px rgba(124, 58, 237, 0.6)",
          },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        }
      },
      transitionDelay: {
        '1500': '1500ms',
        '2000': '2000ms',
        '3000': '3000ms',
        '4000': '4000ms',
      },
    },
  },
  plugins: [],
};

export default config;