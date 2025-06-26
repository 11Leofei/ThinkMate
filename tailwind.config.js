/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cursor dark theme colors with Apple touches
        background: '#0D1117',
        foreground: '#E6EDF3',
        
        // Card backgrounds
        card: '#161B22',
        'card-hover': '#21262D',
        
        // Primary colors - Apple blue with Cursor feel
        primary: '#2563EB',
        'primary-hover': '#1D4ED8',
        'primary-foreground': '#FFFFFF',
        
        // Secondary grays
        secondary: '#30363D',
        'secondary-hover': '#373E47',
        'secondary-foreground': '#B1BAC4',
        
        // Muted colors
        muted: '#21262D',
        'muted-foreground': '#7D8590',
        
        // Accent colors
        accent: '#FD7E14',
        'accent-foreground': '#FFFFFF',
        
        // Border colors
        border: '#30363D',
        'border-muted': '#21262D',
        
        // Input colors
        input: '#0D1117',
        
        // Destructive
        destructive: '#DA3633',
        'destructive-foreground': '#FFFFFF',
        
        // Success
        success: '#2DA44E',
        'success-foreground': '#FFFFFF',
        
        // Warning
        warning: '#FB8500',
        'warning-foreground': '#000000',
        
        // Ring focus
        ring: '#2563EB',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'SF Pro Text',
          'system-ui',
          'sans-serif'
        ],
        mono: [
          'SF Mono',
          'Monaco',
          'Cascadia Code',
          'Fira Code',
          'monospace'
        ],
      },
      fontSize: {
        'xs': ['11px', { lineHeight: '16px' }],
        'sm': ['13px', { lineHeight: '18px' }],
        'base': ['14px', { lineHeight: '20px' }],
        'lg': ['16px', { lineHeight: '24px' }],
        'xl': ['18px', { lineHeight: '26px' }],
        '2xl': ['22px', { lineHeight: '30px' }],
        '3xl': ['28px', { lineHeight: '36px' }],
      },
      borderRadius: {
        'lg': '8px',
        'md': '6px',
        'sm': '4px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'scale-in': 'scaleIn 0.1s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}