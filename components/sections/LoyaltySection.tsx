'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { LOYALTY_TIERS, LoyaltyTierKey } from '@/lib/loyaltyTiers'
import { useBookingStore } from '@/lib/bookingStore'

const TERMS = [
  'Membership is valid for 12 months from date of purchase.',
  'Benefits are non-transferable and may only be used by the registered member.',
  'Fees are non-refundable and cannot be exchanged for cash.',
  'Discounts cannot be combined with other promotions unless stated.',
  'Complimentary services have no cash value and cannot be exchanged.',
  'Complimentary benefits must be used during membership period and do not roll over.',
  'Beauty Experience reserves the right to modify benefits with prior notice.',
  'Privileges may be suspended in cases of misuse or violation of salon policies.',
  'All appointments subject to availability; advance booking recommended.',
]

export default function LoyaltySection() {
  const [tcOpen, setTcOpen] = useState(false)
  const { openLoyalty } = useBookingStore()

  return (
    <section
      id="loyalty"
      className="bg-white py-20 md:py-32 px-8 md:px-16 lg:px-24 overflow-hidden"
    >
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-rose text-xs font-bold uppercase tracking-[0.25em] mb-3"
      >
        ◆ The Inner Circle
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-3xl md:text-5xl font-black text-charcoal mb-4"
      >
        Join the Beauty Elite
      </motion.h2>
      <p className="text-gray-500 font-light mb-12">
        Three tiers. Endless rewards. A membership that pays for itself.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.entries(LOYALTY_TIERS) as [LoyaltyTierKey, typeof LOYALTY_TIERS.rose][]).map(
          ([key, tier], i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-3xl p-8 text-white cursor-pointer select-none"
              style={{
                background: tier.gradient,
                minHeight: 360,
                transition: 'transform 0.5s ease, box-shadow 0.5s ease',
              }}
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect()
                const x = (e.clientX - r.left) / r.width - 0.5
                const y = (e.clientY - r.top) / r.height - 0.5
                e.currentTarget.style.transform = `perspective(600px) rotateY(${x * 18}deg) rotateX(${-y * 18}deg) scale(1.03)`
                e.currentTarget.style.transition = 'transform 0.1s ease'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform =
                  'perspective(600px) rotateY(0) rotateX(0) scale(1)'
                e.currentTarget.style.transition = 'transform 0.5s ease'
              }}
              onClick={() => openLoyalty(key)}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-lg font-black">
                    {tier.badge} {tier.name}
                  </p>
                  <p className="text-white/70 text-sm font-light mt-1">{tier.label}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-widest text-white/60">Discount</p>
                  <p className="text-2xl font-black">{tier.discountPercent}%</p>
                </div>
              </div>
              <ul className="space-y-1.5 mb-8">
                {tier.perks.slice(0, 4).map((perk) => (
                  <li key={perk} className="flex items-start gap-2 text-xs text-white/85">
                    <Check size={12} className="shrink-0 mt-0.5" />
                    {perk}
                  </li>
                ))}
              </ul>
              <button className="w-full bg-white/20 hover:bg-white/30 text-white rounded-full py-2.5 text-sm font-bold uppercase tracking-widest transition-colors">
                {tier.price === 0 ? 'Join Free' : `Join — ${tier.price} AED`}
              </button>
            </motion.div>
          )
        )}
      </div>

      <div className="mt-10 border border-gray-100 rounded-2xl overflow-hidden">
        <button
          onClick={() => setTcOpen(!tcOpen)}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm font-semibold text-charcoal">Membership Terms & Conditions</span>
          <ChevronDown
            size={18}
            className={`text-rose transition-transform duration-300 ${tcOpen ? 'rotate-180' : ''}`}
          />
        </button>
        <AnimatePresence initial={false}>
          {tcOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <ul className="px-5 pb-5 space-y-2">
                {TERMS.map((term) => (
                  <li key={term} className="flex items-start gap-2 text-sm text-gray-500">
                    <span className="text-rose mt-0.5 shrink-0">•</span>
                    {term}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
