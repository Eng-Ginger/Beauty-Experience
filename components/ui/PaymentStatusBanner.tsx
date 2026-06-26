'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { X, AlertCircle } from 'lucide-react'

export default function PaymentStatusBanner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const status = searchParams.get('loyalty') // 'cancel' | 'failure'
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (status === 'cancel' || status === 'failure') {
      setVisible(true)
    }
  }, [status])

  const dismiss = () => {
    setVisible(false)
    router.replace('/')
  }

  if (status !== 'cancel' && status !== 'failure') return null

  const message =
    status === 'cancel'
      ? 'Payment cancelled — no charge was made. You can try again anytime from your profile.'
      : "Payment failed — your card wasn't charged. Please try again."

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[90] w-[92%] max-w-md"
        >
          <div className="bg-white border border-rose/20 shadow-xl rounded-2xl px-5 py-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-rose shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-charcoal">{message}</p>
              {status === 'failure' && (
                <a
                  href="https://api.whatsapp.com/send?phone=971522325578"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-rose uppercase tracking-widest hover:underline mt-2 inline-block"
                >
                  Contact us on WhatsApp →
                </a>
              )}
            </div>
            <button onClick={dismiss} aria-label="Dismiss">
              <X size={16} className="text-gray-400 hover:text-charcoal" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
