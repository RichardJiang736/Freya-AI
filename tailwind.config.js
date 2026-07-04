module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Work Sans', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
      },
      colors: {
        alabaster: {
          DEFAULT: '#f7f4ee',
        },
        sand: {
          DEFAULT: '#f0ece4',
        },
        linen: {
          DEFAULT: '#ede8df',
        },
        oak: {
          DEFAULT: '#e8e2d8',
        },
        ink: {
          DEFAULT: '#3a3530',
        },
        charcoal: {
          DEFAULT: '#6b6560',
        },
        stone: {
          DEFAULT: '#8b8680',
        },
        sage: {
          50: '#f4f6f1',
          100: '#e6eae0',
          200: '#cdd4c2',
          300: '#b1bba2',
          400: '#95a384',
          500: '#7d8c6e',
          600: '#647058',
          700: '#4d5743',
          800: '#383f30',
          900: '#24281e',
        },
        sunlight: {
          DEFAULT: '#f5e6d0',
        },
      },
      transitionTimingFunction: {
        buoyant: 'cubic-bezier(0.23, 1, 0.32, 1)',
        exhale: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        whisper: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        400: '400ms',
        600: '600ms',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        'float-up': {
          '0%': {
            transform: 'translateY(20px)',
            opacity: '0',
            filter: 'blur(2px)',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
            filter: 'blur(0)',
          },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'sage-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(125, 140, 110, 0)' },
          '50%': { boxShadow: '0 0 30px 2px rgba(125, 140, 110, 0.10)' },
        },
        'leaf-sway': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(3px)' },
        },
        'melt-in': {
          '0%': { transform: 'scale(0.97)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        emerge: {
          '0%': {
            transform: 'translateY(16px) scale(0.98)',
            opacity: '0',
            filter: 'blur(6px)',
          },
          '50%': {
            opacity: '0.5',
            filter: 'blur(2px)',
          },
          '100%': {
            transform: 'translateY(0) scale(1)',
            opacity: '1',
            filter: 'blur(0)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        breathe: 'breathe 5s ease-in-out infinite',
        'float-up': 'float-up 0.7s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'fade-in': 'fade-in 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'sage-glow': 'sage-glow 3.5s ease-in-out infinite',
        'leaf-sway': 'leaf-sway 8s ease-in-out infinite',
        'melt-in': 'melt-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        emerge: 'emerge 1.3s cubic-bezier(0.25, 1, 0.5, 1) forwards',
        float: 'float 6s ease-in-out infinite',
      },
      letterSpacing: {
        airy: '0.15em',
        sanctuary: '0.2em',
        wide: '0.12em',
      },
    },
  },
  plugins: [],
};
