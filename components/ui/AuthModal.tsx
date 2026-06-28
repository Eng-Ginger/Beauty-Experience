'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('signin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [signin, setSignin] = useState({ email: '', password: '' })
  const [signup, setSignup] = useState({ name: '', email: '', password: '', phone: '+971', dob: '' })

  useScrollLock(authOpen)

  const close = () => {
    closeAuth()
    setError(null)
  }

  const afterAuth = async () => {
    await refetch()
    router.refresh()
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
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (signup.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signup),
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
                  <div className="mb-4 px-4 py-3 bg-rose/10 border border-rose/30 rounded-xl text-sm text-rose">
                    {error}
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
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={signup.name}
                      onChange={(e) => setSignup({ ...signup, name: e.target.value })}
                      className="w-full bg-off-white border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Email"
                      value={signup.email}
                      onChange={(e) => setSignup({ ...signup, email: e.target.value })}
                      className="w-full bg-off-white border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose"
                    />
                    <input
                      type="password"
                      required
                      placeholder="Password (min 8 characters)"
                      value={signup.password}
                      onChange={(e) => setSignup({ ...signup, password: e.target.value })}
                      className="w-full bg-off-white border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={signup.phone}
                      onChange={(e) => setSignup({ ...signup, phone: e.target.value })}
                      className="w-full bg-off-white border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose"
                    />
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
