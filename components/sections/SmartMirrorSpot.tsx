'use client'
import { useBookingStore } from '@/lib/bookingStore'

const BULLETS = [
  'AI hairstyle try-on in real time',
  'Hair color simulation before you commit',
  'Haircut preview tailored to your face shape',
  'AI hair analysis and personalized recommendations',
]

export default function SmartMirrorSpot() {
  const { openMirror } = useBookingStore()
  return (
    <section
      id="mirror"
      className="w-full"
      style={{ backgroundColor: '#FFFFFF', marginTop: 0, paddingTop: 0 }}
    >
      {/* MOBILE ONLY — unified card */}
      <div className="lg:hidden px-4 py-8">
        <div
          className="rounded-3xl overflow-hidden"
          style={{ border: '1px solid #F0E8EA', backgroundColor: '#FFFFFF' }}
        >
          <div style={{ height: '220px', position: 'relative' }}>
            <img
              src="/mirror-salon.png"
              alt="AI Smart Mirror"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 20%',
              }}
            />
          </div>
          <div style={{ padding: '24px' }}>
            <p
              className="text-xs font-semibold tracking-widest uppercase flex items-center gap-2"
              style={{ color: '#C4768A' }}
            >
              <span>✦</span> AI SMART TECHNOLOGY
            </p>
            <h2
              className="text-3xl font-black leading-tight mt-2"
              style={{ color: '#1A1A1A' }}
            >
              See Yourself Differently<span style={{ color: '#C4768A' }}>.</span>
            </h2>
            <p className="text-sm mt-3 leading-relaxed" style={{ color: '#6B7280' }}>
              Try on hairstyles, hair colors, and haircuts in real time using AI-powered
              smart mirror technology — see your transformation before a single scissor
              cuts.
            </p>
            <ul className="mt-4 space-y-2">
              {BULLETS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm"
                  style={{ color: '#6B7280' }}
                >
                  <span
                    className="flex items-center justify-center rounded-full flex-shrink-0 mt-0.5"
                    style={{ width: '18px', height: '18px', backgroundColor: '#F5E6EA' }}
                  >
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M2 5l2 2 4-4"
                        stroke="#C4768A"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={openMirror}
              className="mt-5 w-full rounded-full font-semibold tracking-widest uppercase text-sm text-white py-4 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#C4768A' }}
            >
              EXPERIENCE IT IN-STUDIO →
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP ONLY — existing layout preserved */}
      <div
        className="hidden lg:grid grid-cols-1 lg:grid-cols-2"
        style={{ minHeight: '700px' }}
      >
        {/* Content column — desktop LEFT, mobile TOP */}
        <div
          className="order-1 flex flex-col justify-center relative px-8 py-16 lg:py-20"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          {/* Decorative blush blob bottom-left */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '200px',
              height: '200px',
              backgroundColor: '#F5E6EA',
              opacity: 0.4,
              bottom: '-60px',
              left: '-60px',
            }}
          />

          {/* Inner content with desktop left padding */}
          <div className="relative z-10 lg:pl-12 lg:pr-4">
            {/* Eyebrow */}
            <p
              className="text-xs font-semibold tracking-widest uppercase flex items-center gap-2"
              style={{ color: '#C4768A' }}
            >
              <span>✦</span> AI SMART TECHNOLOGY
            </p>

            {/* Heading */}
            <h2
              className="text-4xl lg:text-5xl font-black leading-tight mt-3"
              style={{ color: '#1A1A1A' }}
            >
              See Yourself
              <br />
              Differently<span style={{ color: '#C4768A' }}>.</span>
            </h2>

            {/* Body */}
            <p
              className="text-base mt-5 leading-relaxed max-w-md"
              style={{ color: '#6B7280' }}
            >
              Try on hairstyles, hair colors, and haircuts in real time using AI-powered
              smart mirror technology — see your transformation before a single scissor
              cuts.
            </p>

            {/* Bullet points */}
            <ul className="mt-6 space-y-3">
              {BULLETS.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span
                    className="flex items-center justify-center rounded-full flex-shrink-0"
                    style={{ width: '20px', height: '20px', backgroundColor: '#F5E6EA' }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M2 5l2 2 4-4"
                        stroke="#C4768A"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span style={{ color: '#6B7280', fontSize: '15px' }}>{item}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              onClick={openMirror}
              data-cursor="cta"
              className="mt-8 rounded-full font-semibold tracking-wider uppercase text-sm text-white flex items-center gap-2 self-start"
              style={{ backgroundColor: '#C4768A', padding: '14px 32px' }}
            >
              EXPERIENCE IT IN-STUDIO <span>→</span>
            </button>
          </div>
        </div>

        {/* Mirror image — desktop RIGHT, mobile BELOW (peeks) */}
        <div className="relative order-2 h-[260px] lg:h-auto lg:min-h-[500px]">
          <img
            src="/mirror-salon.png"
            alt="AI Smart Mirror"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
            }}
          />
        </div>
      </div>
    </section>
  )
}
