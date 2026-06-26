'use client'
import { motion } from 'framer-motion'
import {
  Search,
  Sparkles,
  ShoppingBag,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  ArrowRight,
} from 'lucide-react'
import { useBookingStore } from '@/lib/bookingStore'
import { useCustomer } from '@/lib/useCustomer'

const SMART_MIRROR_PILLS = [
  { icon: Search, label: 'AI Hair Analysis' },
  { icon: Sparkles, label: 'Virtual Try-On' },
  { icon: ShoppingBag, label: 'Product Matching' },
  { icon: MapPin, label: 'Progress Tracking' },
]

export default function TechShowcase() {
  const { openMirror, openBookingWithService, openAuth, setPendingBooking } = useBookingStore()
  const { customer } = useCustomer()

  const handleBookNails = () => {
    if (customer) openBookingWithService('nails')
    else {
      setPendingBooking(true)
      openAuth()
    }
  }

  return (
    <section
      id="innovations"
      className="bg-white py-20 md:py-32 px-8 md:px-16 lg:px-24 overflow-hidden"
    >
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-rose text-xs font-bold uppercase tracking-[0.25em] mb-3"
      >
        ◆ Our Innovations
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
        className="text-3xl md:text-5xl font-black text-charcoal mb-12"
      >
        Where Beauty Meets Technology
      </motion.h2>

      <div className="flex flex-col gap-5">
        {/* Row 1 — Smart Mirror full-width */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="relative bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[400px]"
        >
          {/* Image — left */}
          <div className="relative w-full md:w-[55%] h-72 md:h-auto overflow-hidden">
            <img
              src="/smart-mirror.png"
              alt="AI Smart Mirror"
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Content — right */}
          <div className="relative w-full md:w-[45%] p-10 md:p-12 flex flex-col justify-center">
            {/* Decorative blush wave */}
            <svg
              aria-hidden
              className="absolute bottom-0 right-0 w-64 h-44 opacity-25 pointer-events-none"
              viewBox="0 0 260 180"
              fill="none"
            >
              <path
                d="M0 110 C50 70 110 140 170 100 C210 70 230 100 260 80 L260 180 L0 180 Z"
                fill="#E8B4C0"
              />
            </svg>

            <div className="relative z-10">
              <p className="text-rose text-xs font-bold uppercase tracking-[0.25em] mb-3">
                ✦ AI Smart Mirror
              </p>
              <h3 className="text-3xl md:text-4xl font-black text-charcoal mb-4 leading-tight">
                The AI Smart Mirror<span className="text-rose">.</span>
              </h3>
              <p className="text-gray-500 font-light mb-6 leading-relaxed">
                We're proud to be among the first in the UAE to integrate cutting-edge
                AI-powered smart mirror technology. This isn't just a mirror — it's your
                personalized beauty experience.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {SMART_MIRROR_PILLS.map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 bg-white border border-blush/40 text-charcoal text-xs px-4 py-1.5 rounded-full"
                  >
                    <Icon className="w-3.5 h-3.5 text-rose" />
                    {label}
                  </span>
                ))}
              </div>
              <button
                onClick={openMirror}
                className="inline-flex items-center gap-2 self-start bg-rose text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-rose/90 transition-colors"
              >
                Experience It In-Studio
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Row 2 — Nail + Concierge */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 2 — Nail Artistry */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="relative bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[360px]"
          >
            {/* Top-left sparkle badge */}
            <div className="absolute top-6 left-6 z-10 w-12 h-12 rounded-2xl bg-rose flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>

            {/* Nail image — centered in upper area */}
            <div
              className="flex justify-center items-end"
              style={{ height: '200px', paddingTop: '16px' }}
            >
              <img
                src="/nail-art.png"
                alt="3D Nail Art"
                style={{ height: '180px', width: 'auto', objectFit: 'contain' }}
              />
            </div>

            {/* Bottom content */}
            <div className="relative z-10 p-8">
              <p className="text-rose text-xs font-bold uppercase tracking-[0.25em] mb-2">
                ✦ Nail Studio
              </p>
              <h3 className="text-2xl md:text-3xl font-black text-charcoal mb-2 leading-tight">
                3D Nail Artistry<span className="text-rose">.</span>
              </h3>
              <p className="text-sm text-gray-500 font-light mb-5 leading-relaxed">
                Direct-to-nail printing for couture designs in minutes. Limitless detail,
                repeatable precision.
              </p>
              <div className="flex justify-between items-center mt-6 gap-2">
                <span
                  className="font-semibold tracking-wider uppercase rounded-full whitespace-nowrap"
                  style={{
                    backgroundColor: '#FADADD',
                    color: '#C4768A',
                    padding: '8px 14px',
                    fontSize: '10px',
                  }}
                >
                  FROM 30 AED PER NAIL
                </span>
                <button
                  onClick={handleBookNails}
                  className="text-xs font-semibold tracking-widest uppercase whitespace-nowrap flex-shrink-0 hover:underline"
                  style={{ color: '#C4768A' }}
                >
                  BOOK →
                </button>
              </div>
            </div>
          </motion.div>

          {/* Card 3 — Concierge */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="bg-white border border-gray-100 rounded-3xl shadow-sm flex flex-col justify-between min-h-[340px] p-8"
          >
            {/* Top bar */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-dusty flex items-center justify-center">
                  <MessageCircle size={20} className="text-rose" />
                </div>
                <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Available 24/7
                </span>
              </div>
              <MoreHorizontal size={20} className="text-gray-300" />
            </div>

            {/* Body */}
            <div>
              <p className="text-rose text-xs font-bold uppercase tracking-[0.25em] mb-2">
                ✦ AI Concierge
              </p>
              <h3 className="text-2xl md:text-3xl font-black text-charcoal mb-2 leading-tight">
                AI Beauty Concierge<span className="text-rose">.</span>
              </h3>
              <p className="text-sm text-gray-500 font-light mb-5 leading-relaxed">
                Curates rituals to your mood, skin, and calendar. Booking, reminders, and product
                matches — all in one quiet whisper.
              </p>
              <a
                href="https://api.whatsapp.com/send?phone=971522325578"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-rose text-rose px-6 py-2 rounded-full text-sm uppercase tracking-widest font-bold hover:bg-rose hover:text-white transition-colors"
              >
                Start Chatting <ArrowRight size={14} />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
