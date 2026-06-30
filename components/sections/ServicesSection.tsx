'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { SERVICES } from '@/lib/services'
import { useBookingStore } from '@/lib/bookingStore'
import { useCustomer } from '@/lib/useCustomer'

const STARTING_FROM_KEYS = [
  'henna',
  'makeup',
  'hair-blowdry',
  'hair-wavy',
  'hair-cut',
  'hair-style',
  'color',
  'hair-treatment',
]

export default function ServicesSection() {
  const [openKey, setOpenKey] = useState<string | null>(null)
  const { openBookingWithService, openAuth, setPendingBooking } = useBookingStore()
  const { customer } = useCustomer()

  const handleBookCategory = (serviceKey: string) => {
    if (customer) openBookingWithService(serviceKey)
    else {
      setPendingBooking(true)
      openAuth()
    }
  }

  return (
    <section
      id="services"
      className="bg-white py-20 md:py-32 px-8 md:px-16 lg:px-24 overflow-hidden"
    >
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-rose text-xs font-bold uppercase tracking-[0.25em] mb-3"
      >
        ◆ Full Menu
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-3xl md:text-5xl font-black text-charcoal mb-12 leading-tight"
      >
        Every service, every price —<br />open and clear.
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SERVICES.map((service) => {
          const isOpen = openKey === service.key
          return (
            <div
              key={service.key}
              className={`bg-white rounded-2xl border transition-all duration-300 ${
                isOpen
                  ? 'border-blush shadow-lg shadow-blush/10'
                  : 'border-gray-100 hover:border-blush/40 hover:shadow-sm'
              }`}
            >
              <button
                className="w-full flex items-start justify-between p-6 text-left"
                onClick={() => setOpenKey(isOpen ? null : service.key)}
              >
                <div className="flex-1 pr-3">
                  <h3 className="font-bold text-lg text-charcoal">{service.label}</h3>
                  <p className="text-sm text-gray-400 mt-1 font-light">{service.description}</p>
                  <p className="text-rose text-xs font-bold mt-2 uppercase tracking-widest">
                    From AED {service.startingFrom}
                  </p>
                </div>
                <ChevronDown
                  size={20}
                  className={`text-rose mt-1 shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 border-t border-gray-50 pt-4">
                      <div
                        className="space-y-1 mb-4 overflow-y-auto pr-2"
                        style={{ maxHeight: 280 }}
                        data-lenis-prevent
                      >
                        {service.items.map((item) => (
                          <div
                            key={item.name}
                            className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 gap-3"
                          >
                            <span className="text-sm text-charcoal">{item.name}</span>
                            <span className="text-sm font-bold text-rose shrink-0">
                              {STARTING_FROM_KEYS.includes(service.key)
                                ? `From ${item.price} AED`
                                : `${item.price} AED`}
                            </span>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => handleBookCategory(service.key)}
                        className="w-full bg-rose text-white rounded-full py-3 text-sm font-bold uppercase tracking-widest hover:bg-rose/90 transition-colors"
                      >
                        Book This Category
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </section>
  )
}
