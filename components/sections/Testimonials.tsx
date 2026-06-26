'use client'
import { motion } from 'framer-motion'

const TESTIMONIALS = [
  {
    name: 'Maroush Aatif',
    rating: 5,
    text: "I'm so happy with the service. I was so comfortable and the procedure was done so gently. I would definitely recommend! The salon itself is very aesthetic and clean. Loved it!",
  },
  {
    name: 'Angelyn Castillo',
    rating: 5,
    text: "My first time here and I really loved the experience! The staff were so genuine, friendly, and made me feel comfortable right away. They really listened to what I wanted and gave honest recommendations. I'm very happy with the result and will definitely come back!",
  },
  {
    name: 'Riem El',
    rating: 5,
    text: 'My mum and I came here for the first time to get our hair and nails done. The staff were very friendly and kind. We felt very comfortable and welcome. The salon is very nice and clean, and everything was done very neatly.',
  },
  {
    name: 'Ulla Styleage',
    rating: 5,
    text: 'Amazing service! The haircut and hair finishing were done perfectly. Very professional team and a lovely experience overall. Highly recommend this salon.',
  },
  {
    name: 'Ariana Elayne Infante',
    rating: 5,
    text: 'Very good experience, welcoming staff, and a good-looking salon. Highly recommended. I highly suggest this salon in the Sharjah area.',
  },
  {
    name: 'Fatemeh Hedayat',
    rating: 5,
    text: "My experience was great! Like nothing I've had before. She was very patient and thorough. Definitely recommend!",
  },
  {
    name: 'Rafia Khawar',
    rating: 5,
    text: "I'm so happy with the service! I got a refill for my gel extensions with chrome and French tips, and the result was incredible. Love my new nails.",
  },
  {
    name: 'Blossom A',
    rating: 5,
    text: 'The shop is really clean, the reception is so sweet, and I had a great experience!',
  },
]

function Card({ name, text }: { name: string; rating: number; text: string }) {
  return (
    <div className="bg-white border border-blush/20 rounded-2xl p-6 w-80 shrink-0 shadow-sm">
      <p className="text-gold text-sm mb-3">★★★★★</p>
      <p className="text-sm text-charcoal/80 font-light italic mb-4 leading-relaxed">"{text}"</p>
      <p className="text-rose text-xs font-bold uppercase tracking-widest">{name}</p>
    </div>
  )
}

export default function Testimonials() {
  const reversed = [...TESTIMONIALS].reverse()
  return (
    <section
      id="testimonials"
      className="bg-white py-20 md:py-32 overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="px-8 md:px-16 lg:px-24 text-center mb-16"
      >
        <blockquote className="text-xl md:text-3xl font-light italic text-charcoal/80 leading-relaxed max-w-4xl mx-auto">
          "Every visit feels like a private ritual — and the technology is unlike any salon I have been to in the region."
        </blockquote>
        <div className="mt-6">
          <div className="w-12 h-px bg-rose mx-auto mb-4" />
          <p className="font-bold text-sm tracking-widest uppercase">Mariam Al Shamsi</p>
          <p className="text-xs text-rose tracking-widest uppercase mt-1">Founding Platinum Member</p>
        </div>
      </motion.div>

      {/* Row 1 */}
      <div className="marquee-pause relative overflow-hidden mb-4">
        <div
          className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #FFFFFF, transparent)' }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #FFFFFF, transparent)' }}
        />
        <div className="flex gap-4 marquee-left" style={{ width: 'max-content' }}>
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
            <Card key={`r1-${i}`} {...t} />
          ))}
        </div>
      </div>

      {/* Row 2 */}
      <div className="marquee-pause relative overflow-hidden">
        <div
          className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #FFFFFF, transparent)' }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #FFFFFF, transparent)' }}
        />
        <div className="flex gap-4 marquee-right" style={{ width: 'max-content' }}>
          {[...reversed, ...reversed].map((t, i) => (
            <Card key={`r2-${i}`} {...t} />
          ))}
        </div>
      </div>
    </section>
  )
}
