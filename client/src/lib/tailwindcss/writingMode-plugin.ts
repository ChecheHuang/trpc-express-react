import plugin from 'tailwindcss/plugin'

export const writingModePlugin = plugin(function ({ addUtilities }) {
  const newUtilities = {
    '.horizontal-tb': {
      writingMode: 'horizontal-tb',
    },
    '.vertical-rl': {
      writingMode: 'vertical-rl',
    },
    '.vertical-lr': {
      writingMode: 'vertical-lr',
    },
  }
  addUtilities(newUtilities)
})
