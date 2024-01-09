import tailwindScrollbar from 'tailwind-scrollbar'
import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

import { writingModePlugin } from './src/lib/tailwindcss/writingMode-plugin'

const config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: '#001529',
        light: '#fff',
      },
      // fontFamily: {
      //   kaiti: ['KaiTi', 'sans-serif'],
      // },
    },
  },
  plugins: [tailwindScrollbar, tailwindcssAnimate, writingModePlugin],
  corePlugins: {
    preflight: false,
  },
} satisfies Config

export default config
