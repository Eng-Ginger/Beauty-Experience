'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserCircle,
  LogOut,
  User,
  Calendar,
  Sparkles,
  Home,
  Lightbulb,
  ScanFace,
  Gem,
} from 'lucide-react'
import { useBookingStore } from '@/lib/bookingStore'
import { useCustomer } from '@/lib/useCustomer'
import { useScrollLock } from '@/lib/useScrollLock'

const LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'innovations', label: 'Innovations' },
  { id: 'services', label: 'Services' },
  { id: 'mirror', label: 'Mirror' },
  { id: 'loyalty', label: 'Loyalty' },
  { id: 'about', label: 'About' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { openBooking, openAuth, setPendingBooking } = useBookingStore()
  const { customer, refetch } = useCustomer()

  useScrollLock(menuOpen)

  const isAdminRoute = pathname?.startsWith('/admin') ?? false

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY >= 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (pathname !== '/') return
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[]
    if (!sections.length) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )
    sections.forEach((s) => obs.observe(s))
    return () => obs.disconnect()
  }, [pathname])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const handleNavClick = (sectionId: string) => {
    if (pathname === '/') {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      router.push(`/#${sectionId}`)
    }
  }

  const handleBook = () => {
    if (customer) {
      openBooking()
    } else {
      setPendingBooking(true)
      openAuth()
    }
  }

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    await refetch()
    setDropdownOpen(false)
    setMenuOpen(false)
    router.push('/')
  }

  const initials = customer?.name
    ? customer.name
        .split(' ')
        .map((s) => s[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : ''
  const firstName = customer?.name?.split(' ')[0] ?? ''

  if (isAdminRoute) return null

  const Hamburger = ({ open }: { open: boolean }) => (
    <span className="relative w-6 h-6 flex items-center justify-center">
      <span
        className="absolute w-5 h-0.5 bg-charcoal rounded-full transition-all duration-300"
        style={{ transform: open ? 'rotate(45deg)' : 'translateY(-4px)' }}
      />
      <span
        className="absolute w-5 h-0.5 bg-charcoal rounded-full transition-all duration-300"
        style={{ transform: open ? 'rotate(-45deg)' : 'translateY(4px)' }}
      />
    </span>
  )

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
          scrolled || pathname !== '/' ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
        }`}
      >
        {/* Desktop */}
        <div className="hidden lg:flex items-center justify-between h-20 px-8 md:px-16">
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 shrink-0"
          >
            <img
              src="/logo.png"
              alt="Beauty Experience"
              style={{ height: '56px', width: 'auto', objectFit: 'contain' }}
            />
            <span className="font-black text-lg text-charcoal">Beauty Experience</span>
          </button>

          <nav className="flex items-center gap-8">
            {LINKS.map((link) => {
              const isActive = pathname === '/' && active === link.id
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative text-sm font-medium transition-colors ${
                    isActive ? 'text-rose' : 'text-charcoal/70 hover:text-rose'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="navUnderline"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-rose rounded-full"
                    />
                  )}
                </button>
              )
            })}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={handleBook}
              data-cursor="cta"
              className="bg-rose text-white px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-rose/90 transition-colors"
            >
              Book Now
            </button>
            {customer ? (
              <div ref={dropdownRef} className="relative">
                <button onClick={() => setDropdownOpen((v) => !v)} className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-rose text-white flex items-center justify-center text-xs font-bold">
                    {initials}
                  </div>
                  <span className="text-sm font-semibold text-charcoal">{firstName}</span>
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                    >
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-charcoal hover:bg-dusty"
                      >
                        <User size={16} className="text-rose" /> My Profile
                      </Link>
                      <Link
                        href="/profile#bookings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-charcoal hover:bg-dusty"
                      >
                        <Calendar size={16} className="text-rose" /> My Bookings
                      </Link>
                      <Link
                        href="/profile#membership"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-charcoal hover:bg-dusty"
                      >
                        <Sparkles size={16} className="text-rose" /> My Membership
                      </Link>
                      <div className="h-px bg-gray-100" />
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-charcoal hover:bg-dusty text-left"
                      >
                        <LogOut size={16} className="text-rose" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={openAuth}
                className="flex items-center gap-1.5 text-rose text-sm font-semibold hover:opacity-80"
              >
                <UserCircle size={18} /> Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile / Tablet */}
        <div className="flex lg:hidden items-center justify-between px-5 py-4">
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 shrink-0"
          >
            <img
              src="/logo.png"
              alt=""
              style={{ height: '56px', width: 'auto', objectFit: 'contain' }}
            />
            <span className="font-black text-sm text-charcoal">Beauty Experience</span>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBook}
              className="bg-rose text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide"
            >
              Book Now
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              className="flex items-center justify-center"
            >
              <Hamburger open={menuOpen} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay — clean white */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex flex-col lg:hidden"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            {/* Top bar */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: '#F0E8EA' }}
            >
              <div className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="BE"
                  style={{
                    height: '36px',
                    width: 'auto',
                    objectFit: 'contain',
                    mixBlendMode: 'multiply',
                  }}
                />
                <span className="font-bold text-base" style={{ color: '#1A1A1A' }}>
                  Beauty Experience
                </span>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="p-2"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1A1A1A"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Nav items */}
            <div
              className="flex-1 px-5 py-6 space-y-2 overflow-y-auto"
              data-lenis-prevent
            >
              {[
                {
                  id: 'home',
                  label: 'Home',
                  icon: <Home size={18} color="#C4768A" strokeWidth={1.5} />,
                },
                {
                  id: 'innovations',
                  label: 'Innovations',
                  icon: <Lightbulb size={18} color="#C4768A" strokeWidth={1.5} />,
                },
                {
                  id: 'services',
                  label: 'Services',
                  icon: <Sparkles size={18} color="#C4768A" strokeWidth={1.5} />,
                },
                {
                  id: 'mirror',
                  label: 'Mirror',
                  icon: <ScanFace size={18} color="#C4768A" strokeWidth={1.5} />,
                },
                {
                  id: 'loyalty',
                  label: 'Loyalty',
                  icon: <Gem size={18} color="#C4768A" strokeWidth={1.5} />,
                },
                {
                  id: 'about',
                  label: 'About',
                  icon: <User size={18} color="#C4768A" strokeWidth={1.5} />,
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setMenuOpen(false)
                    handleNavClick(item.id)
                  }}
                  className="w-full flex items-center justify-between rounded-2xl px-4 py-4"
                  style={{ backgroundColor: '#FFFFFF', border: '1px solid #FADADD' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center rounded-full"
                      style={{
                        width: '36px',
                        height: '36px',
                        backgroundColor: '#FDF5F7',
                      }}
                    >
                      {item.icon}
                    </div>
                    <span className="font-semibold text-base" style={{ color: '#1A1A1A' }}>
                      {item.label}
                    </span>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#C4768A"
                    strokeWidth="2"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
            </div>

            {/* Bottom section */}
            <div
              className="px-5 pb-8 pt-4 space-y-4 border-t"
              style={{ borderColor: '#F0E8EA' }}
            >
              <button
                onClick={() => {
                  setMenuOpen(false)
                  handleBook()
                }}
                className="w-full rounded-full font-bold text-white text-base py-4 flex items-center justify-center gap-2"
                style={{ backgroundColor: '#A85070' }}
              >
                <span>✦</span> BOOK NOW
              </button>

              {customer ? (
                <div className="flex items-center justify-between">
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3"
                  >
                    <div
                      className="flex items-center justify-center rounded-full text-white font-bold text-sm"
                      style={{
                        width: '36px',
                        height: '36px',
                        backgroundColor: '#C4768A',
                      }}
                    >
                      {customer.name?.charAt(0).toUpperCase()}
                    </div>
                    <span
                      className="font-medium text-sm"
                      style={{ color: '#1A1A1A' }}
                    >
                      {customer.name}
                    </span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-sm underline"
                    style={{ color: '#9CA3AF' }}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    openAuth()
                  }}
                  className="w-full text-center text-sm font-medium"
                  style={{ color: '#C4768A' }}
                >
                  Sign In
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
