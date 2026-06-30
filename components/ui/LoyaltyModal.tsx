'use client'
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { X, Check, MessageCircle, Sparkles, UserCircle, ChevronDown } from 'lucide-react'
import { LOYALTY_TIERS, LoyaltyTierKey } from '@/lib/loyaltyTiers'
import { useBookingStore } from '@/lib/bookingStore'
import { useCustomer } from '@/lib/useCustomer'
import { useScrollLock } from '@/lib/useScrollLock'

const TIER_RANKS: Record<string, number> = { rose: 1, gold: 2, platinum: 3 }
const getTierRank = (t: string | null | undefined) =>
  (t && TIER_RANKS[t.toLowerCase()]) ?? 0

type CurrentMembership = {
  tier: string
  status: string
  expires_at: string
  discount_percent?: number
}

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

export default function LoyaltyModal() {
  const { loyaltyOpen, closeLoyalty, selectedTier, openAuth, setPendingLoyalty } = useBookingStore()
  const { customer, refetch } = useCustomer()
  const [step, setStep] = useState(1)
  const [tier, setTier] = useState<LoyaltyTierKey | null>(null)
  const [dob, setDob] = useState('')
  const [redirecting, setRedirecting] = useState(false)
  const isSubmittingRef = useRef(false)
  const [whatsappFallback, setWhatsappFallback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [tcOpen, setTcOpen] = useState(false)
  const [currentMembership, setCurrentMembership] = useState<CurrentMembership | null>(null)
  const [membershipLoading, setMembershipLoading] = useState(false)

  useScrollLock(loyaltyOpen)

  useEffect(() => {
    if (!customer || !loyaltyOpen) {
      setCurrentMembership(null)
      return
    }
    let cancelled = false
    setMembershipLoading(true)
    fetch('/api/loyalty/my-membership', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : { membership: null }))
      .then((data) => {
        if (!cancelled) {
          setCurrentMembership(data?.membership ?? null)
          setMembershipLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCurrentMembership(null)
          setMembershipLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [customer, loyaltyOpen])

  useEffect(() => {
    if (loyaltyOpen) {
      setTier(selectedTier)
      if (selectedTier && customer) setStep(2)
      else setStep(1)
    }
  }, [loyaltyOpen, selectedTier, customer])

  useEffect(() => {
    if (customer && loyaltyOpen) {
      setDob(customer.dob ?? '')
    }
  }, [customer, loyaltyOpen])

  const close = () => {
    closeLoyalty()
    setTimeout(() => {
      setStep(1)
      setRedirecting(false)
      setWhatsappFallback(null)
      setError(null)
      setAgreedToTerms(false)
      setTcOpen(false)
      isSubmittingRef.current = false
    }, 300)
  }

  const proceed = async () => {
    if (!tier || !customer) return
    if (isSubmittingRef.current) return
    isSubmittingRef.current = true
    setLoading(true)
    setError(null)
    setWhatsappFallback(null)
    try {
      const details = {
        name: customer.name,
        email: customer.email,
        phone: customer.phone ?? '',
        dob: dob || customer.dob || null,
      }
      if (tier === 'rose') {
        const res = await fetch('/api/loyalty/join-free', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(details),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Could not join')
        await refetch()
        isSubmittingRef.current = false
        setStep(4)
      } else {
        const res = await fetch('/api/loyalty/create-intent', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...details, tier }),
        })
        const data = await res.json()
        if (!res.ok) {
          if (data.whatsappUrl) setWhatsappFallback(data.whatsappUrl)
          throw new Error(data.error || 'Payment unavailable')
        }
        // Browser is about to navigate away — no need to reset the ref.
        setStep(3)
        setRedirecting(true)
        window.location.href = data.payment_url
        return
      }
    } catch (err: any) {
      setError(err.message)
      isSubmittingRef.current = false
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {loyaltyOpen && (
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
            className="relative max-w-2xl w-full bg-white rounded-3xl shadow-2xl flex flex-col"
            style={{ maxHeight: '92vh' }}
          >
            <button
              onClick={close}
              aria-label="Close"
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <X size={18} />
            </button>

            {/* SIGN-IN GATE */}
            {!customer ? (
              <div className="flex flex-col items-center justify-center p-12 text-center gap-6 min-h-[400px]">
                <UserCircle size={56} className="text-blush" />
                <h2 className="text-2xl font-black text-charcoal">Sign in to Join</h2>
                <p className="text-gray-400 text-sm max-w-xs">
                  Create a free account or sign in to join The Inner Circle and link your membership to your profile.
                </p>
                <button
                  onClick={() => {
                    closeLoyalty()
                    setPendingLoyalty(true)
                    setTimeout(() => openAuth(), 200)
                  }}
                  className="w-full max-w-xs bg-rose text-white rounded-full py-4 font-bold text-sm uppercase tracking-widest"
                >
                  Sign In / Create Account
                </button>
                <button onClick={close} className="text-sm text-gray-400 underline">
                  Maybe later
                </button>
              </div>
            ) : membershipLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-[3px] border-rose/30 border-t-rose rounded-full animate-spin" />
              </div>
            ) : currentMembership?.status === 'active' &&
              tier &&
              currentMembership.tier.toLowerCase() === tier.toLowerCase() ? (
              <div className="flex flex-col items-center justify-center py-16 px-8 text-center gap-2 min-h-[400px]">
                <div className="text-4xl mb-2">✨</div>
                <h2 className="text-2xl font-black mb-2" style={{ color: '#1A1A1A' }}>
                  You're already a {LOYALTY_TIERS[tier].name.split(' ')[0]} Member!
                </h2>
                <p className="text-sm mb-6 max-w-xs" style={{ color: '#6B7280' }}>
                  Your membership is active until{' '}
                  {new Date(currentMembership.expires_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                  .
                </p>
                <button
                  onClick={close}
                  className="rounded-full px-8 py-3 font-semibold text-white text-sm uppercase tracking-widest"
                  style={{ backgroundColor: '#A85070' }}
                >
                  Back to Salon
                </button>
              </div>
            ) : currentMembership?.status === 'active' &&
              tier &&
              getTierRank(currentMembership.tier) > getTierRank(tier) ? (
              <div className="flex flex-col items-center justify-center py-16 px-8 text-center gap-2 min-h-[400px]">
                <div className="text-4xl mb-2">⚠️</div>
                <h2 className="text-2xl font-black mb-2" style={{ color: '#1A1A1A' }}>
                  You already have a higher tier
                </h2>
                <p className="text-sm mb-6 max-w-sm" style={{ color: '#6B7280' }}>
                  You're currently a{' '}
                  <span className="capitalize font-semibold">{currentMembership.tier}</span>{' '}
                  member. Switching to{' '}
                  <span className="capitalize font-semibold">{tier}</span> would be a downgrade.
                  Please contact us if you'd like to make changes.
                </p>
                <button
                  onClick={close}
                  className="rounded-full px-8 py-3 font-semibold text-white text-sm uppercase tracking-widest"
                  style={{ backgroundColor: '#A85070' }}
                >
                  Keep My <span className="capitalize">{currentMembership.tier}</span> Membership
                </button>
              </div>
            ) : step === 1 ? (
              <>
                <div className="shrink-0 p-8 pb-4">
                  <p className="text-rose text-xs font-bold uppercase tracking-[0.25em] mb-2">
                    ◆ Inner Circle
                  </p>
                  <h2 className="text-2xl font-black text-charcoal mb-1">Choose your tier</h2>
                  <p className="text-sm text-gray-500">All memberships valid for 12 months.</p>
                </div>
                <div
                  className="flex-1 overflow-y-auto px-8 min-h-0"
                  data-lenis-prevent
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
                    {(Object.entries(LOYALTY_TIERS) as [LoyaltyTierKey, typeof LOYALTY_TIERS.rose][]).map(
                      ([key, t]) => (
                        <button
                          key={key}
                          onClick={() => setTier(key)}
                          className={`rounded-2xl p-5 text-white text-left transition-transform ${
                            tier === key ? 'ring-4 ring-rose scale-[1.02]' : 'hover:scale-[1.02]'
                          }`}
                          style={{ background: t.gradient, minHeight: 200 }}
                        >
                          <p className="text-base font-black">
                            {t.badge} {t.name}
                          </p>
                          <p className="text-white/80 text-xs mt-1 mb-3">{t.label}</p>
                          <p className="text-3xl font-black mb-2">{t.discountPercent}%</p>
                          <p className="text-xs text-white/70 uppercase tracking-widest">Discount</p>
                        </button>
                      )
                    )}
                  </div>
                </div>
                <div className="shrink-0 p-6 pt-4 border-t border-gray-50 flex justify-end">
                  <button
                    disabled={!tier}
                    onClick={() => setStep(2)}
                    className="bg-rose text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest disabled:opacity-40 hover:bg-rose/90 transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </>
            ) : step === 2 && tier ? (
              <>
                <div className="shrink-0 p-8 pb-4">
                  <p className="text-rose text-xs font-bold uppercase tracking-[0.25em] mb-2">
                    ◆ {LOYALTY_TIERS[tier].name}
                  </p>
                  <h2 className="text-2xl font-black text-charcoal mb-1">Confirm your details</h2>
                  <p className="text-sm text-gray-500">
                    We'll send your member card to your account email.
                  </p>
                </div>
                <div
                  className="flex-1 overflow-y-auto px-8 min-h-0"
                  data-lenis-prevent
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  <div className="bg-dusty text-rose text-sm font-semibold px-4 py-2 rounded-full inline-flex items-center gap-2 mb-5">
                    <Check size={14} /> Joining as {customer.name}
                  </div>

                  {!customer.dob && (
                    <div className="mb-5">
                      <label className="text-xs text-gray-400 uppercase tracking-widest ml-1">
                        Date of Birth (for birthday perks)
                      </label>
                      <input
                        type="date"
                        required
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full bg-off-white border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose mt-1"
                      />
                    </div>
                  )}

                  <div className="bg-dusty rounded-2xl p-5 mb-5">
                    <p className="text-sm font-bold text-charcoal mb-2">
                      {LOYALTY_TIERS[tier].name} — {LOYALTY_TIERS[tier].label}
                    </p>
                    <ul className="space-y-1.5">
                      {LOYALTY_TIERS[tier].perks.slice(0, 4).map((p) => (
                        <li key={p} className="flex items-start gap-2 text-xs text-charcoal/80">
                          <Check size={12} className="shrink-0 mt-0.5 text-rose" /> {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 accent-rose"
                    />
                    <span className="text-sm text-gray-500">
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={() => setTcOpen((v) => !v)}
                        className="text-rose underline font-semibold inline-flex items-center gap-1"
                      >
                        Membership Terms & Conditions
                        <ChevronDown
                          size={12}
                          className={`transition-transform ${tcOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </span>
                  </label>

                  <AnimatePresence initial={false}>
                    {tcOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden bg-off-white rounded-2xl border border-gray-100 mb-5"
                      >
                        <ul className="px-4 py-3 space-y-2">
                          {TERMS.map((t) => (
                            <li key={t} className="flex items-start gap-2 text-xs text-gray-500">
                              <span className="text-rose mt-0.5 shrink-0">•</span> {t}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {error && (
                    <div className="mb-4 px-4 py-3 bg-rose/10 border border-rose/30 rounded-xl text-sm text-rose">
                      {error}
                    </div>
                  )}

                  {whatsappFallback && (
                    <a
                      href={whatsappFallback}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 hover:bg-green-100"
                    >
                      <MessageCircle size={14} className="inline mr-2" />
                      Continue this signup on WhatsApp →
                    </a>
                  )}
                </div>
                <div className="shrink-0 p-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="text-sm text-gray-500 hover:text-charcoal"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={proceed}
                    disabled={loading || !agreedToTerms}
                    className="bg-rose text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose/90 transition-colors"
                  >
                    {loading
                      ? 'Working…'
                      : tier === 'rose'
                      ? 'Join Free'
                      : `Pay ${LOYALTY_TIERS[tier].price} AED`}
                  </button>
                </div>
              </>
            ) : step === 3 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center gap-4 min-h-[300px]">
                <div className="w-10 h-10 border-[3px] border-rose/30 border-t-rose rounded-full animate-spin" />
                <h2 className="text-xl font-black text-charcoal">Redirecting you to secure payment</h2>
                <p className="text-sm text-gray-500 max-w-xs">
                  You'll be taken to Ziina to complete payment, then brought
                  back here automatically.
                </p>
              </div>
            ) : step === 4 && tier ? (
              <>
                <div
                  className="flex-1 overflow-y-auto p-10 text-center min-h-0"
                  data-lenis-prevent
                >
                  <div className="w-16 h-16 mx-auto rounded-full bg-rose/10 flex items-center justify-center mb-4">
                    <Sparkles size={28} className="text-rose" />
                  </div>
                  <h2 className="text-3xl font-black text-charcoal mb-2">
                    Welcome, {LOYALTY_TIERS[tier].name.split(' ')[0]}.
                  </h2>
                  <p className="text-sm text-gray-500">
                    Your membership is active. Discounts apply to your very next visit.
                  </p>
                </div>
                <div className="shrink-0 p-6 pt-4 border-t border-gray-50 flex justify-center">
                  <Link
                    href="/profile#membership"
                    onClick={close}
                    className="inline-block bg-rose text-white px-10 py-3 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-rose/90 transition-colors"
                  >
                    View My Membership
                  </Link>
                </div>
              </>
            ) : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
