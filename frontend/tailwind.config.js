/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lotus: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f472b6',
          400: '#f43f5e',
          500: '#ec4899', // Hồng cánh sen tươi chuẩn
          600: '#db2777', // Hồng sen đậm nét chủ đạo
          700: '#be185d', // Hồng sen sâu quý phái
          800: '#9d174d',
          900: '#831843',
        },
        primary: {
          DEFAULT: '#db2777',
          light: '#f472b6',
          dark: '#be185d',
        },
        surface: '#ffffff',
        appbg: '#fdfafd',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans JP', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        jp: ['Noto Sans JP', 'sans-serif'],
      },
      boxShadow: {
        'lotus': '0 8px 30px -4px rgba(219, 39, 119, 0.12)',
        'lotus-lg': '0 14px 40px -6px rgba(219, 39, 119, 0.2)',
        'lotus-sm': '0 2px 10px -1px rgba(219, 39, 119, 0.08)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 2.5s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        }
      }
    },
  },
  plugins: [],
}
