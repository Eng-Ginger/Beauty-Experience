'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { MapPin } from 'lucide-react'

const STATS = [
  { value: 1000, suffix: '+', label: 'Clients' },
  { value: 4, suffix: '', label: 'Expert Specialists' },
  { value: 1, suffix: '', label: 'Industry Award' },
]

function CountUp({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    let raf = 0
    const start = performance.now()
    const duration = 1400
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(eased * to))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to])

  return (
    <span ref={ref}>
      {value.toLocaleString()}
      {suffix}
    </span>
  )
}

export default function AboutSection() {
  return (
    <section
      id="about"
      className="bg-white py-20 md:py-32 px-8 md:px-16 lg:px-24 overflow-hidden"
    >
      <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-start">
        {/* LEFT */}
        <div className="w-full md:w-1/2 relative">
          <div className="absolute -top-3 -left-2 z-10">
            <span className="bg-white border border-blush/30 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase shadow-sm">
              Established · 2025
            </span>
          </div>
          <div className="w-full rounded-3xl overflow-hidden shadow-lg border border-gray-100 flex flex-col bg-white">
            <iframe
              src="https://www.google.com/maps?q=Beauty+Experience+Ladies+Salon+Almajaz+2+Sharjah&output=embed"
              className="w-full border-0"
              style={{ height: 320 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Beauty Experience Location"
            />
            <div className="bg-white p-6">
              <div className="flex items-start gap-3">
                <MapPin className="text-rose mt-0.5 shrink-0" size={18} />
                <div>
                  <p className="font-bold text-sm tracking-widest uppercase text-charcoal">
                    Sharjah · Almajaz 2
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Alkaloti Building, Shop 1 + 2</p>
                  <p className="text-sm text-gray-500">Open 10:00 – 22:00 daily</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full md:w-1/2 flex flex-col justify-center"
        >
          <p className="text-rose text-xs font-bold uppercase tracking-[0.25em] mb-3">◆ Our Atelier</p>
          <h2 className="text-3xl md:text-5xl font-black text-charcoal leading-tight mb-6">
            Built on craft.
            <br />
            <span className="text-rose">Powered by AI.</span>
          </h2>
          <p className="text-base text-gray-500 font-light leading-relaxed mb-10">
            Founded by Dr. Rana Shehadeh, Beauty Experience is home to the first Smart Mirror
            Hair & Beauty Try-On in the UAE. Using AI-powered technology, our clients can preview
            haircuts, colors, and hairstyles in real time — before any commitment. Beyond the
            mirror, we offer advanced hair treatments, nail care, facials, and wellness services,
            all tailored to you.
          </p>
          <div className="border-t border-gray-100 pt-8">
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-3 gap-3 md:gap-12">
                {STATS.map((stat) => (
                  <div key={stat.label} className="flex flex-col">
                    <p className="text-2xl md:text-5xl font-black text-rose">
                      <CountUp to={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="text-[10px] md:text-xs uppercase tracking-widest text-gray-400 mt-1 leading-tight">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 pt-2">
                <img
                  src="/fresha-badge.png"
                  alt="Fresha Highly Recommended 2026"
                  className="w-20 h-20 object-contain"
                />
                <div>
                  <p className="text-xs font-bold text-charcoal uppercase tracking-widest">
                    Highly Recommended
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Fresha · 2026</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
