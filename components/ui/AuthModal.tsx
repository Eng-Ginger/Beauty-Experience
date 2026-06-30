'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useBookingStore } from '@/lib/bookingStore'
import { useCustomer } from '@/lib/useCustomer'
import { useScrollLock } from '@/lib/useScrollLock'

type Tab = 'signin' | 'signup'

export default function AuthModal() {
  const {
    authOpen,
    closeAuth,
    openBooking,
    pendingBooking,
    setPendingBooking,
    pendingLoyalty,
    setPendingLoyalty,
    openLoyalty,
    selectedTier,
  } = useBookingStore()
  const { refetch } = useCustomer()
  const [tab, setTab] = useState<Tab>('signin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wrongPassword, setWrongPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({})

  const [signin, setSignin] = useState({ email: '', password: '' })
  const [signup, setSignup] = useState({ name: '', email: '', password: '', phone: '+971', dob: '' })

  useScrollLock(authOpen)

  const close = () => {
    closeAuth()
    setError(null)
    setWrongPassword(false)
    setFieldErrors({})
  }

  const afterAuth = async () => {
    await refetch()
    close()
    if (pendingBooking) {
      setPendingBooking(false)
      setTimeout(() => openBooking(), 400)
    } else if (pendingLoyalty) {
      setPendingLoyalty(false)
      setTimeout(() => openLoyalty(selectedTier ?? undefined), 400)
    }
  }

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signin),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Sign-in failed')
      await afterAuth()
    } catch (err: any) {
      setError(err.message)
      if (
        err.message?.toLowerCase().includes('invalid') ||
        err.message?.toLowerCase().includes('password') ||
        err.message?.toLowerCase().includes('credentials')
      ) {
        setWrongPassword(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors: Record<string, string> = {}

    if (!signup.name || signup.name.trim().length < 2) {
      errors.name = 'Please enter a valid full name.'
    }
    if (!signup.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signup.email)) {
      errors.email = 'Please enter a valid email address.'
    }
    if (!signup.password || signup.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.'
    } else if (signup.password.length > 72) {
      errors.password = 'Password must be under 72 characters.'
    }
    const uaePhoneRegex = /^\+971[0-9]{9}$/
    const cleanPhone = signup.phone.replace(/\s|-/g, '')
    if (!uaePhoneRegex.test(cleanPhone)) {
      errors.phone = 'Please enter a valid UAE phone number (e.g. +971501234567).'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...signup, phone: cleanPhone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not create account')
      await afterAuth()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {authOpen && (
        <motion.div
          initial={{ opacity: 0, pointerEvents: 'none' }}
          animate={{ opacity: 1, pointerEvents: 'auto' }}
          exit={{ opacity: 0, pointerEvents: 'none' }}
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl flex flex-col"
            style={{ maxHeight: '90vh' }}
          >
            <button
              onClick={close}
              aria-label="Close"
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <X size={18} />
            </button>

            <form
              onSubmit={tab === 'signin' ? handleSignin : handleSignup}
              className="flex flex-col flex-1 min-h-0"
            >
              {/* Header */}
              <div className="shrink-0 p-8 pb-4">
                <h2 className="text-2xl font-black text-charcoal mb-1">
                  Welcome to Beauty Experience
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  {tab === 'signin' ? 'Sign in to book your experience.' : 'Create an account to begin.'}
                </p>
                <div className="relative flex gap-6 border-b border-gray-100">
                  {(['signin', 'signup'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setTab(t)
                        setError(null)
                        setWrongPassword(false)
                        setFieldErrors({})
                      }}
                      className={`relative pb-3 text-sm font-bold uppercase tracking-widest ${
                        tab === t ? 'text-rose' : 'text-charcoal/50'
                      }`}
                    >
                      {t === 'signin' ? 'Sign In' : 'Create Account'}
                      {tab === t && (
                        <motion.span
                          layoutId="authTab"
                          className="absolute -bottom-px left-0 right-0 h-0.5 bg-rose"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable middle */}
              <div
                className="flex-1 overflow-y-auto px-8 min-h-0"
                data-lenis-prevent
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {error && (
                  <div className="mb-4 px-4 py-3 bg-rose/10 border border-rose/30 rounded-xl text-sm text-rose space-y-3">
                    <p>{error}</p>
                    {wrongPassword && tab === 'signin' && (
                      <div className="pt-1">
                        <p className="text-xs text-rose/80 mb-2">
                          Forgot your password? Contact us on WhatsApp and we'll reset it for you.
                        </p>
                        <a
                          href="https://api.whatsapp.com/send?phone=971522325578"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-[#25D366] text-white text-xs font-bold px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                          Chat on WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {tab === 'signin' ? (
                  <div className="space-y-3 pb-4">
                    <input
                      type="email"
                      required
                      placeholder="Email"
                      value={signin.email}
                      onChange={(e) => setSignin({ ...signin, email: e.target.value })}
                      className="w-full bg-off-white border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose"
                    />
                    <input
                      type="password"
                      required
                      placeholder="Password"
                      value={signin.password}
                      onChange={(e) => setSignin({ ...signin, password: e.target.value })}
                      className="w-full bg-off-white border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose"
                    />
                  </div>
                ) : (
                  <div className="space-y-3 pb-4">
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        value={signup.name}
                        onChange={(e) => {
                          setSignup({ ...signup, name: e.target.value })
                          setFieldErrors((p) => ({ ...p, name: undefined }))
                        }}
                        className={`w-full bg-off-white border rounded-xl px-4 py-3 text-sm outline-none focus:border-rose ${
                          fieldErrors.name ? 'border-rose/60' : 'border-gray-100'
                        }`}
                      />
                      {fieldErrors.name && (
                        <p className="text-xs text-rose mt-1 ml-1">{fieldErrors.name}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="email"
                        required
                        placeholder="Email"
                        value={signup.email}
                        onChange={(e) => {
                          setSignup({ ...signup, email: e.target.value })
                          setFieldErrors((p) => ({ ...p, email: undefined }))
                        }}
                        className={`w-full bg-off-white border rounded-xl px-4 py-3 text-sm outline-none focus:border-rose ${
                          fieldErrors.email ? 'border-rose/60' : 'border-gray-100'
                        }`}
                      />
                      {fieldErrors.email && (
                        <p className="text-xs text-rose mt-1 ml-1">{fieldErrors.email}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="password"
                        required
                        placeholder="Password (min 8 characters)"
                        value={signup.password}
                        onChange={(e) => {
                          setSignup({ ...signup, password: e.target.value })
                          setFieldErrors((p) => ({ ...p, password: undefined }))
                        }}
                        className={`w-full bg-off-white border rounded-xl px-4 py-3 text-sm outline-none focus:border-rose ${
                          fieldErrors.password ? 'border-rose/60' : 'border-gray-100'
                        }`}
                      />
                      {fieldErrors.password && (
                        <p className="text-xs text-rose mt-1 ml-1">{fieldErrors.password}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="tel"
                        placeholder="+971 XX XXX XXXX"
                        value={signup.phone}
                        onChange={(e) => {
                          setSignup({ ...signup, phone: e.target.value })
                          setFieldErrors((p) => ({ ...p, phone: undefined }))
                        }}
                        required
                        className={`w-full bg-off-white border rounded-xl px-4 py-3 text-sm outline-none focus:border-rose ${
                          fieldErrors.phone ? 'border-rose/60' : 'border-gray-100'
                        }`}
                      />
                      {fieldErrors.phone && (
                        <p className="text-xs text-rose mt-1 ml-1">{fieldErrors.phone}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-widest ml-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={signup.dob}
                        onChange={(e) => setSignup({ ...signup, dob: e.target.value })}
                        className="w-full bg-off-white border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="shrink-0 p-6 pt-4 border-t border-gray-50">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-rose text-white py-3.5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-rose/90 transition-colors disabled:opacity-50"
                >
                  {loading
                    ? tab === 'signin'
                      ? 'Signing in…'
                      : 'Creating…'
                    : tab === 'signin'
                    ? 'Sign In'
                    : 'Create Account'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
