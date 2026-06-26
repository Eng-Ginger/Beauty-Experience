'use client'
import { Instagram, MessageCircle } from 'lucide-react'

const LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#innovations', label: 'Innovations' },
  { href: '#services', label: 'Services' },
  { href: '#mirror', label: 'Mirror' },
  { href: '#loyalty', label: 'Loyalty' },
  { href: '#about', label: 'About' },
]

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="bg-dark text-white pt-16 pb-8 px-8 md:px-16 lg:px-24 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-white/10">
        <div>
          {/* Brand row — logo beside name */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/logo.png"
              alt="Beauty Experience"
              style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
            />
            <p className="font-black text-white text-lg">Beauty Experience</p>
          </div>
          <p className="text-white/50 text-sm font-light mb-4 leading-relaxed">
            Luxury ladies salon in Sharjah blending master craft with quietly intelligent technology.
          </p>
          <p className="text-white/50 text-sm leading-relaxed">
            Al Kaluti Building - Jamal Abdul Naser St - Al Majaz 2 - Al Majaz - Sharjah
          </p>
        </div>

        <div>
          <p className="text-white/40 text-xs uppercase tracking-widest mb-4">Navigate</p>
          <ul className="space-y-2">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="text-white/70 hover:text-white text-sm transition-colors">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-white/40 text-xs uppercase tracking-widest mb-4">Get in Touch</p>
          <div className="flex gap-3">
            <a
              href="https://www.instagram.com/beautyels_official/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-white/50 transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://www.tiktok.com/@beautyels_official"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-white/50 transition-colors"
              aria-label="TikTok"
            >
              <TikTokIcon />
            </a>
            <a
              href="https://api.whatsapp.com/send?phone=971522325578"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-white/50 transition-colors"
              aria-label="WhatsApp"
            >
              <MessageCircle size={18} />
            </a>
          </div>
          <p className="text-white/50 text-sm mt-4">hello@beautyels.com</p>
        </div>
      </div>

      <div className="mt-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <p className="text-2xl md:text-3xl font-black">
            Quiet drops, <span className="text-rose italic">never spam.</span>
          </p>
          <p className="text-white/40 text-xs mt-1 uppercase tracking-widest">
            Circle Previews · Seasonal Events · The Occasional Surprise.
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            ;(e.currentTarget.elements.namedItem('email') as HTMLInputElement).value = ''
          }}
          className="flex gap-2 w-full md:w-auto"
        >
          <input
            type="email"
            name="email"
            required
            placeholder="your@email.com"
            className="bg-white/10 border border-white/20 rounded-full px-5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/40 flex-1 md:w-64"
          />
          <button
            type="submit"
            className="bg-rose text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-rose/90 transition-colors"
          >
            Join
          </button>
        </form>
      </div>

      <div className="mt-8 border-t border-white/10 pt-6 text-center">
        <p className="text-white/30 text-xs">© 2025 Beauty Experience. All Rights Reserved.</p>
      </div>
    </footer>
  )
}
