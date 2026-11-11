/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#2563EB',
          navy: '#163B72',
          light: '#EFF6FF',
          dark: '#0F274A',
          subtle: '#DBEAFE',
          accent: '#3B82F6',
        },
        surface: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          hover: '#F1F5F9',
        },
        slate: {
          text: '#1E293B',
          muted: '#64748B',
          light: '#94A3B8',
        },
        status: {
          success: '#16A34A',
          'success-light': '#DCFCE7',
          warning: '#F59E0B',
          'warning-light': '#FEF3C7',
          error: '#DC2626',
          'error-light': '#FEE2E2',
          info: '#2563EB',
          'info-light': '#EFF6FF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px -1px rgba(22, 59, 114, 0.06), 0 1px 3px -1px rgba(22, 59, 114, 0.04)',
        'card': '0 4px 16px -2px rgba(22, 59, 114, 0.08), 0 2px 6px -1px rgba(22, 59, 114, 0.04)',
        'hover': '0 10px 25px -3px rgba(37, 99, 235, 0.12), 0 4px 10px -2px rgba(22, 59, 114, 0.06)',
        'dropdown': '0 12px 30px -4px rgba(22, 59, 114, 0.15)',
      }
    },
  },
  plugins: [],
}
