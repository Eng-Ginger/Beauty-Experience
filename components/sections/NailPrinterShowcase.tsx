'use client'
import { useBookingStore } from '@/lib/bookingStore'
import { useCustomer } from '@/lib/useCustomer'

const NAIL_SERVICE_KEY = 'nails'

const BULLETS = [
  'Custom design printed in under 30 seconds per nail',
  'Photo-real artwork in full color',
  'Gentle, no-contact application',
  'Pairs with any gel, acrylic, or natural finish',
]

export default function NailPrinterShowcase() {
  const { openBookingWithService, openAuth, setPendingBooking } = useBookingStore()
  const { customer } = useCustomer()

  const handleBook = () => {
    if (customer) openBookingWithService(NAIL_SERVICE_KEY)
    else {
      setPendingBooking(true)
      openAuth()
    }
  }

  return (
    <section id="nail-studio" className="w-full" style={{ backgroundColor: '#FFFFFF' }}>
      {/* MOBILE ONLY — unified card */}
      <div className="lg:hidden px-4 py-8">
        <div
          className="rounded-3xl overflow-hidden"
          style={{ border: '1px solid #F0E8EA', backgroundColor: '#FFFFFF' }}
        >
          <div style={{ height: '220px', position: 'relative' }}>
            <img
              src="/nail-printer11.png"
              alt="O2Nails AI Nail Printer"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center center',
              }}
            />
          </div>
          <div style={{ padding: '24px' }}>
            <p
              className="text-xs font-semibold tracking-widest uppercase flex items-center gap-2"
              style={{ color: '#C4768A' }}
            >
              <span>✦</span> SMART NAIL TECHNOLOGY
            </p>
            <h2
              className="text-3xl font-black leading-tight mt-2"
              style={{ color: '#1A1A1A' }}
            >
              Nails Printed in Perfection<span style={{ color: '#C4768A' }}>.</span>
              <span className="inline-block ml-2 text-lg" style={{ color: '#C4768A' }}>
                ✦
              </span>
            </h2>
            <p className="text-sm mt-3 leading-relaxed" style={{ color: '#6B7280' }}>
              Our AI nail printer paints couture designs straight to your nail. Choose from
              thousands of patterns or upload your own — micro-detail, perfect symmetry, every
              time.
            </p>
            <ul className="mt-4 space-y-2">
              {BULLETS.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm"
                  style={{ color: '#6B7280' }}
                >
                  <span style={{ color: '#C4768A' }}>•</span> {item}
                </li>
              ))}
            </ul>
            <div
              className="flex rounded-xl overflow-hidden mt-5"
              style={{ border: '1px solid #E8D5DA' }}
            >
              <div style={{ flex: '1.2' }} className="px-4 py-3">
                <p
                  className="text-xs font-semibold tracking-wider uppercase"
                  style={{ color: '#9CA3AF' }}
                >
                  FULL SET
                </p>
                <p className="text-2xl font-black mt-0.5" style={{ color: '#C4768A' }}>
                  200 <span className="text-sm">AED</span>
                </p>
              </div>
              <div style={{ width: '1px', backgroundColor: '#E8D5DA', margin: '10px 0' }} />
              <div style={{ flex: '0.8' }} className="px-4 py-3">
                <p
                  className="text-xs font-semibold tracking-wider uppercase"
                  style={{ color: '#9CA3AF' }}
                >
                  PER NAIL
                </p>
                <p className="text-2xl font-black mt-0.5" style={{ color: '#C4768A' }}>
                  30 <span className="text-sm">AED</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleBook}
              className="mt-5 w-full rounded-full font-semibold tracking-widest uppercase text-sm text-white py-4"
              style={{ backgroundColor: '#A85070' }}
            >
              BOOK NAIL ART SESSION
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP ONLY — existing layout preserved */}
      <div
        className="hidden lg:grid grid-cols-1 lg:grid-cols-2"
        style={{ minHeight: '700px' }}
      >
        {/* Image column — desktop LEFT, mobile BELOW (peeks) */}
        <div className="relative order-2 lg:order-1 h-[260px] lg:h-auto lg:min-h-[400px]">
          <img
            src="/nail-printer11.png"
            alt="O2Nails AI Nail Printer"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top center',
            }}
          />
          {/* Gradient fade — right edge of image dissolves into white (desktop only) */}
          <div
            className="hidden lg:block"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '180px',
              height: '100%',
              background: 'linear-gradient(to right, transparent, #FFFFFF)',
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Content column — desktop RIGHT, mobile TOP */}
        <div
          className="order-1 lg:order-2 flex flex-col justify-center px-6 py-10 lg:px-14 lg:py-16"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          {/* Eyebrow */}
          <p
            className="text-xs font-semibold tracking-widest uppercase flex items-center gap-2"
            style={{ color: '#C4768A' }}
          >
            <span>✦</span> SMART NAIL TECHNOLOGY
          </p>

          {/* Heading */}
          <h2
            className="text-4xl lg:text-5xl font-black leading-tight mt-3"
            style={{ color: '#1A1A1A' }}
          >
            Nails Printed in
            <br />
            Perfection.
            <span
              className="inline-block ml-3 text-2xl"
              style={{ color: '#C4768A' }}
            >
              ✦
            </span>
          </h2>

          {/* Body */}
          <p
            className="text-base mt-5 leading-relaxed"
            style={{ color: '#6B7280' }}
          >
            Our AI nail printer paints couture designs straight to your nail. Choose from
            thousands of patterns or upload your own — micro-detail, perfect symmetry, every
            time.
          </p>

          {/* Bullet points */}
          <ul className="mt-6 space-y-3">
            {BULLETS.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span style={{ color: '#C4768A', fontSize: '18px' }}>•</span>
                <span style={{ color: '#6B7280' }}>{item}</span>
              </li>
            ))}
          </ul>

          {/* Price bar */}
          <div
            className="flex rounded-2xl overflow-hidden mt-8"
            style={{ border: '1px solid #E8D5DA', backgroundColor: '#FFFFFF' }}
          >
            <div style={{ flex: '1.2' }} className="px-6 py-4">
              <p
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: '#9CA3AF' }}
              >
                AI SMART NAIL ART — FULL SET
              </p>
              <p className="text-3xl font-black mt-1" style={{ color: '#C4768A' }}>
                200 <span className="text-lg font-semibold">AED</span>
              </p>
            </div>

            <div style={{ width: '1px', backgroundColor: '#E8D5DA', margin: '12px 0' }} />

            <div style={{ flex: '0.8' }} className="px-6 py-4">
              <p
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: '#9CA3AF' }}
              >
                PER NAIL
              </p>
              <p className="text-3xl font-black mt-1" style={{ color: '#C4768A' }}>
                30 <span className="text-lg font-semibold">AED</span>
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleBook}
            className="mt-8 rounded-full font-semibold tracking-widest uppercase text-sm text-white self-start"
            style={{
              backgroundColor: '#A85070',
              padding: '16px 40px',
            }}
          >
            BOOK NAIL ART SESSION
          </button>
        </div>
      </div>
    </section>
  )
}
