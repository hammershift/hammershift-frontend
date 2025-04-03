import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--gradient-stops))',
      },
      colors: {
        gold: {
          '100': '#EBCB48', //lighter yellow
          '200': '#F2CA16'  // darker yellow
        },
        shade: {
          '25': '#253747',
          '50': '#1a2c3d',
          '100': '#172431'
        }
      },
      fontFamily: {
        'euro': 'euro-star-black-extended'
      }
    },
    screens: {
      'sx': '390px',
      // => @media (min-width: 390px) { ... }

      'sm': '640px',
      // => @media (min-width: 640px) { ... }

      'md': '768px',
      // => @media (min-width: 768px) { ... }

      'lg': '1024px',
      // => @media (min-width: 1024px) { ... }

      'xl': '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1440px',
      // => @media (min-width: 1440px) { ... }
    }
  },
  plugins: [],
}
export default config
