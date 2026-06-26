'use client'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Award, Cpu, Heart } from 'lucide-react'
import { useBookingStore } from '@/lib/bookingStore'
import { useCustomer } from '@/lib/useCustomer'

const BADGES = [
  { icon: Award, label: 'Expert Technicians' },
  { icon: Sparkles, label: 'Premium Products' },
  { icon: Cpu, label: 'AI Enhanced Care' },
  { icon: Heart, label: 'Luxurious Experience' },
]

export default function HeroSection() {
  const { openBooking, openAuth, setPendingBooking } = useBookingStore()
  const { customer } = useCustomer()

  const handleBook = () => {
    if (customer) openBooking()
    else {
      setPendingBooking(true)
      openAuth()
    }
  }

  return (
    <section id="home" className="relative min-h-screen overflow-hidden bg-off-white">
      {/* BG */}
      <img
        src="/hero-bg.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ zIndex: 0 }}
      />
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(105deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.85) 35%, rgba(255,255,255,0.3) 60%, rgba(255,255,255,0) 100%)',
          zIndex: 1,
        }}
      />
      {/* Mobile vertical overlay for legibility */}
      <div
        className="absolute inset-0 md:hidden"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.88) 45%, rgba(255,255,255,0.3) 100%)',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center min-h-screen px-8 md:px-16 lg:px-24 pt-24 pb-16 max-w-[700px]">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-rose text-xs font-bold uppercase tracking-[0.25em] mb-4"
        >
          ◆ Sharjah's Finest Beauty Atelier
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 18 }}
          className="text-5xl sm:text-7xl lg:text-9xl font-black text-charcoal leading-none"
        >
          BEAUTY
        </motion.h1>

        <motion.h1
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 18, delay: 0.15 }}
          className="text-5xl sm:text-7xl lg:text-9xl font-black leading-none mb-6"
          style={{ WebkitTextStroke: '2px #C4768A', color: 'transparent' }}
        >
          EXPERIENCE
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-base md:text-lg text-charcoal/60 font-light max-w-md mb-8 leading-relaxed"
        >
          Where artistry meets innovation. AI-enhanced beauty, luxurious rituals,
          and expert care — all in one exceptional experience.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-wrap gap-4 mb-12"
        >
          <button
            onClick={handleBook}
            data-cursor="cta"
            className="bg-rose text-white px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-rose/90 transition-colors"
          >
            Book Your Experience
          </button>
          <a
            href="#innovations"
            className="flex items-center gap-2 text-charcoal font-semibold text-sm hover:text-rose transition-colors group"
          >
            Discover More
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap gap-x-6 gap-y-3"
        >
          {BADGES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon size={16} className="text-rose" />
              <span className="uppercase text-xs tracking-widest text-charcoal/60">{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
