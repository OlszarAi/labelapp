import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // Enable dark mode with CSS class
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        // Performance optimized animations
        "slow-blob": "blob 15s infinite cubic-bezier(0.4, 0, 0.2, 1)", // Better easing for smoother motion
        "float": "float 8s cubic-bezier(0.4, 0, 0.2, 1) infinite", // Improved easing
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "gradient": "gradient 8s linear infinite",
        "text": "textGradient 3s ease infinite",
        
        // Optimized fade animations
        "fade-in": "fadeIn 0.7s ease-out forwards", // Shorter, more efficient animation
        "fade-in-delay": "fadeIn 0.7s ease-out 0.3s forwards",
        "fade-in-delay-2": "fadeIn 0.7s ease-out 0.6s forwards",
        
        // Other animations
        "scroll-down": "scrollDown 2s ease-in-out infinite",
        "shooting-star": "shootingStar 6s linear infinite",
        "button-glow": "buttonGlow 2s ease-in-out infinite",
        "shimmer": "shimmer 2.5s ease-in-out infinite", // Optimized shimmer timing
      },
      keyframes: {
        // Optimized blob animation with will-change property in mind
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
          "0%": { opacity: "0", transform: "translateY(15px)" }, // Reduced distance for better performance
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
          "10%": { opacity: "1" },
          "70%": { opacity: "1" },
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
      // Add performance properties
      willChange: {
        'auto': 'auto',
        'scroll': 'scroll-position',
        'contents': 'contents',
        'transform': 'transform',
        'opacity': 'opacity',
        'opacity-transform': 'opacity, transform',
      },
    },
  },
  plugins: [],
};

export default config;