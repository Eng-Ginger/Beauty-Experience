'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PageLoader() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2000)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
          className="fixed inset-0 z-[9999] bg-off-white flex flex-col items-center justify-center"
        >
          <motion.img
            src="/logo.png"
            alt="Beauty Experience"
            className="h-20 w-20 object-contain"
            style={{ mixBlendMode: 'multiply' }}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="font-black text-2xl mt-4 text-charcoal tracking-wide"
          >
            Beauty Experience
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
