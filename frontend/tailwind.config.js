/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        govbg: '#F7F9FC',
        cardbg: '#FFFFFF',
        govblue: {
          DEFAULT: '#315B8A',
          hover: '#25476D',
          light: '#EAF2FA',
          subtle: '#F0F5FA',
          dark: '#1D3B5C',
        },
        govteal: {
          DEFAULT: '#328477',
          hover: '#27685E',
          light: '#DDF3EF',
          subtle: '#EEF8F6',
        },
        govtext: {
          DEFAULT: '#263445',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
        govborder: '#E2E8F0',
        govstatus: {
          successBg: '#E8F5EC',
          successText: '#1B6A34',
          warningBg: '#FFF4D6',
          warningText: '#945B03',
          errorBg: '#FCE8E8',
          errorText: '#A82525',
          infoBg: '#EAF2FA',
          infoText: '#315B8A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'gov': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'gov-md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}

