/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-primary)',
        foreground: 'var(--text-primary)',
        panel: 'var(--bg-panel)',
        surface: {
          DEFAULT: 'var(--bg-panel)',
          foreground: 'var(--text-primary)',
          muted: 'var(--bg-panel-muted)',
        },
        muted: {
          DEFAULT: 'var(--bg-panel-muted)',
          foreground: 'var(--text-muted)',
        },
        border: 'var(--border-color)',
        'border-subtle': 'var(--border-subtle)',
        input: 'var(--border-subtle)',
        primary: {
          DEFAULT: 'var(--accent-primary)',
          foreground: 'var(--accent-primary-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent-secondary)',
          foreground: 'var(--text-primary)',
        },
        glow: 'var(--glow-color)',
        'glow-soft': 'var(--glow-soft)',
        ring: 'var(--ring-color)',
        
        // Universal Triage State Colors
        danger: '#f43f5e',
        warning: '#f59e0b',
        success: '#10b981',
        silver: '#94a3b8',
        bronze: '#d97706',
      },
    },
  },
  plugins: [],
}
