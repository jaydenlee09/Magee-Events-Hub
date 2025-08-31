/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        floatHorizontal: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(20px)' },
        },
        pulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        rotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        subtleDrift: {
          '0%': { backgroundPosition: '0% 0%' },
          '25%': { backgroundPosition: '10% -5%' },
          '50%': { backgroundPosition: '0% -10%' },
          '75%': { backgroundPosition: '-10% -5%' },
          '100%': { backgroundPosition: '0% 0%' },
        },
        subtleDriftReverse: {
          '0%': { backgroundPosition: '0% 0%' },
          '25%': { backgroundPosition: '-10% 5%' },
          '50%': { backgroundPosition: '0% 10%' },
          '75%': { backgroundPosition: '10% 5%' },
          '100%': { backgroundPosition: '0% 0%' },
        },
        subtleDrift1: {
          '0%': { transform: 'translate(0px, 0px)' },
          '33%': { transform: 'translate(5px, -8px)' },
          '66%': { transform: 'translate(-3px, -4px)' },
          '100%': { transform: 'translate(0px, 0px)' },
        },
        subtleDrift2: {
          '0%': { transform: 'translate(0px, 0px)' },
          '33%': { transform: 'translate(-4px, 6px)' },
          '66%': { transform: 'translate(6px, 2px)' },
          '100%': { transform: 'translate(0px, 0px)' },
        },
        subtleDrift3: {
          '0%': { transform: 'translate(0px, 0px)' },
          '33%': { transform: 'translate(7px, 2px)' },
          '66%': { transform: 'translate(-2px, -6px)' },
          '100%': { transform: 'translate(0px, 0px)' },
        },
        subtleDrift4: {
          '0%': { transform: 'translate(0px, 0px)' },
          '33%': { transform: 'translate(-6px, -3px)' },
          '66%': { transform: 'translate(1px, 5px)' },
          '100%': { transform: 'translate(0px, 0px)' },
        },
        blobMove1: {
          '0%': { transform: 'translate(0px, 0px) scale(1) rotate(0deg)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1) rotate(120deg)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9) rotate(240deg)' },
          '100%': { transform: 'translate(0px, 0px) scale(1) rotate(360deg)' },
        },
        blobMove2: {
          '0%': { transform: 'translate(0px, 0px) scale(1) rotate(0deg)' },
          '33%': { transform: 'translate(-30px, 30px) scale(1.1) rotate(-120deg)' },
          '66%': { transform: 'translate(20px, -20px) scale(0.9) rotate(-240deg)' },
          '100%': { transform: 'translate(0px, 0px) scale(1) rotate(-360deg)' },
        },
        blobMove3: {
          '0%': { transform: 'translate(0px, 0px) scale(1) rotate(0deg)' },
          '33%': { transform: 'translate(40px, 25px) scale(0.9) rotate(60deg)' },
          '66%': { transform: 'translate(-30px, -40px) scale(1.1) rotate(180deg)' },
          '100%': { transform: 'translate(0px, 0px) scale(1) rotate(360deg)' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.7s ease-in',
        scaleIn: 'scaleIn 0.3s ease-out forwards',
        'float-slow': 'float 20s ease-in-out infinite',
        'float-medium': 'float 15s ease-in-out infinite reverse',
        'float-fast': 'floatHorizontal 17s ease-in-out infinite',
        'pulse-slow': 'pulse 25s ease-in-out infinite',
        'rotate-slow': 'rotate 40s linear infinite',
        'rotate-medium': 'rotate 30s linear infinite reverse',
        'subtle-drift': 'subtleDrift 60s ease-in-out infinite',
        'subtle-drift-reverse': 'subtleDriftReverse 65s ease-in-out infinite',
        'subtle-drift-1': 'subtleDrift1 80s ease-in-out infinite',
        'subtle-drift-2': 'subtleDrift2 90s ease-in-out infinite',
        'subtle-drift-3': 'subtleDrift3 100s ease-in-out infinite',
        'subtle-drift-4': 'subtleDrift4 110s ease-in-out infinite',
        'blob-move-1': 'blobMove1 40s ease-in-out infinite',
        'blob-move-2': 'blobMove2 45s ease-in-out infinite',
        'blob-move-3': 'blobMove3 50s ease-in-out infinite',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    }
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      }
      addUtilities(newUtilities)
    }
  ],
} 