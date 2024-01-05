import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

type TextProps = {
  text: string
  delay?: number
}

const Text = ({ text, delay = 100 }: TextProps) => {
  const [visibleText, setVisibleText] = useState('')
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    if (!text) return
    let currentIndex = 0
    let newText = ''

    const interval = setInterval(() => {
      if (currentIndex === text.length) {
        clearInterval(interval)
        setShowCursor(false)
        return
      }

      newText += text[currentIndex]
      setVisibleText(newText)
      currentIndex++
    }, delay)

    return () => {
      clearInterval(interval)
    }
  }, [text, delay])
  return (
    <span>
      {visibleText !== '' &&
        visibleText.split('').map((char, index) => {
          if (char === ' ') {
            return null
          }
          return (
            <motion.span
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              style={{
                marginRight: index === visibleText.length - 1 ? '0.2rem' : 0,
              }}
            >
              {char}
            </motion.span>
          )
        })}
      {showCursor && (
        <motion.span
          className="cursor"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          |
        </motion.span>
      )}
    </span>
  )
}

export default Text
