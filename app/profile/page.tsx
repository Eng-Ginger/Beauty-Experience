'use client'
export const dynamic = 'force-dynamic'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LogOut, Sparkles, Calendar, User as UserIcon, Phone, Mail, Cake } from 'lucide-react'
import { format } from 'date-fns'
import { useCustomer } from '@/lib/useCustomer'
import { useBookingStore } from '@/lib/bookingStore'
import { LOYALTY_TIERS, LoyaltyTierKey } from '@/lib/loyaltyTiers'
import Footer from '@/components/layout/Footer'
import LoyaltyModal from '@/components/ui/LoyaltyModal'
import AuthModal from '@/components/ui/AuthModal'
import BookingModal from '@/components/ui/BookingModal'

type Booking = {
  bookingId: string
  service: string
  date: string
  time: string
  specialist: string
  status: string
  createdAt: string
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center bg-off-white pt-24"><p className="text-sm text-gray-500">Loading…</p></main>}>
      <ProfilePageInner />
    </Suspense>
  )
}

function ProfilePageInner() {
  const { customer, loading, refetch } = useCustomer()
  const { openLoyalty, openBooking } = useBookingStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pendingMembershipId = searchParams.get('membership')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [confirmingPayment, setConfirmingPayment] = useState(!!pendingMembershipId)
  const [confirmTimedOut, setConfirmTimedOut] = useState(false)

  const confirmCancel = async (bookingId: string) => {
    const res = await fetch('/api/bookings/cancel', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    })
    if (res.ok) {
      setBookings((prev) => prev.filter((b) => b.bookingId !== bookingId))
    }
    setCancellingId(null)
  }

  const statusStyles: Record<string, string> = {
    upcoming: 'bg-dusty text-rose',
    completed: 'bg-gray-100 text-gray-400',
    cancelled: 'bg-gray-50 text-gray-300 line-through',
  }

  useEffect(() => {
    if (!loading && !customer) {
      router.push('/?signin=true')
    }
  }, [loading, customer, router])

  // Coming back from a Ziina redirect with ?membership=BE-M-XXXXXX. The
  // webhook usually activates it within a second or two, but it can land
  // slightly after the browser redirect does — poll briefly instead of
  // showing a stale "no membership" state.
  useEffect(() => {
    if (!pendingMembershipId) return
    let attempts = 0
    const maxAttempts = 8
    const id = setInterval(async () => {
      attempts++
      try {
        await fetch('/api/loyalty/confirm', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ membershipId: pendingMembershipId }),
        })
      } catch {
        // ignore — next poll attempt will retry
      }
      await refetch()
      if (attempts >= maxAttempts) {
        clearInterval(id)
        setConfirmingPayment(false)
        setConfirmTimedOut(true)
      }
    }, 1500)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingMembershipId])

  useEffect(() => {
    if (
      pendingMembershipId &&
      customer?.membership?.membershipId === pendingMembershipId
    ) {
      setConfirmingPayment(false)
      setConfirmTimedOut(false)
      router.replace('/profile#membership')
    }
  }, [customer, pendingMembershipId, router])

  useEffect(() => {
    if (!customer) return
    fetch('/api/bookings/list', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : { bookings: [] }))
      .then((d) => setBookings(d.bookings || []))
      .catch(() => setBookings([]))
      .finally(() => setBookingsLoading(false))
  }, [customer])

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    await refetch()
    router.push('/')
  }

  if (loading || !customer) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-off-white pt-24">
        <p className="text-sm text-gray-500">Loading…</p>
      </main>
    )
  }

  const initials = customer.name
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const tier = customer.membership?.tier as LoyaltyTierKey | undefined
  const tierData = tier && LOYALTY_TIERS[tier]
  const membershipIsActive = customer.membership?.status === 'active'
  const membershipIsExpired = !!tier && !membershipIsActive

  return (
    <>
      <main className="min-h-screen bg-white pt-24 md:pt-32">
        <div className="px-8 md:px-16 lg:px-24 max-w-5xl mx-auto pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-rose text-white flex items-center justify-center text-2xl font-black shrink-0">
              {initials}
            </div>
            <div className="flex-1">
              <p className="text-rose text-xs font-bold uppercase tracking-[0.25em] mb-1">
                ◆ My Profile
              </p>
              <h1 className="text-3xl md:text-4xl font-black text-charcoal mb-2">
                {customer.name}
              </h1>
              <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-500">
                <p className="flex items-center gap-2">
                  <Mail size={14} className="text-rose" /> {customer.email}
                </p>
                {customer.phone && (
                  <p className="flex items-center gap-2">
                    <Phone size={14} className="text-rose" /> {customer.phone}
                  </p>
                )}
                {customer.dob && (
                  <p className="flex items-center gap-2">
                    <Cake size={14} className="text-rose" /> {customer.dob}
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <UserIcon size={14} className="text-rose" /> {customer.customerId}
                </p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="self-start inline-flex items-center gap-2 border border-gray-200 hover:border-rose text-charcoal hover:text-rose px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest transition-colors"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </motion.div>

        {/* MEMBERSHIP */}
        <section id="membership" className="mb-8">
          <h2 className="text-2xl font-black text-charcoal mb-4 flex items-center gap-2">
            <Sparkles size={20} className="text-rose" /> My Membership
          </h2>

          {confirmingPayment && (
            <div className="mb-4 px-5 py-4 bg-dusty rounded-2xl flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-rose/30 border-t-rose rounded-full animate-spin shrink-0" />
              <p className="text-sm text-rose font-semibold">
                Confirming your payment — this usually takes just a few seconds…
              </p>
            </div>
          )}
          {confirmTimedOut && (
            <div className="mb-4 px-5 py-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <p className="text-sm text-amber-700">
                Payment received — your membership is still activating.
                Refresh this page in a moment, or contact us if it doesn't
                appear shortly.
              </p>
            </div>
          )}

          {tier && tierData && membershipIsActive ? (
            <div
              className="rounded-3xl p-8 text-white relative overflow-hidden"
              style={{ background: tierData.gradient }}
            >
              <div
                className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-30"
                style={{ background: 'rgba(255,255,255,0.4)' }}
              />
              <div className="relative">
                <p className="text-lg font-black">
                  {tierData.badge} {tierData.name}
                </p>
                <p className="text-white/80 text-sm mt-1">{tierData.label}</p>
                <div className="mt-6 grid grid-cols-2 gap-4 max-w-md">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/70">Discount</p>
                    <p className="text-3xl font-black">{tierData.discountPercent}%</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/70">Expires</p>
                    <p className="text-sm font-bold mt-2">
                      {customer.membership?.expiresAt
                        ? format(new Date(customer.membership.expiresAt), 'd MMM yyyy')
                        : '—'}
                    </p>
                  </div>
                </div>
                <p className="text-xs uppercase tracking-widest text-white/70 mt-6">Member ID</p>
                <p className="text-sm font-bold">{customer.membership?.membershipId}</p>
              </div>
            </div>
          ) : null}

          {membershipIsExpired && tierData && (
            <div className="bg-white border border-amber-200 rounded-3xl p-8 text-center mb-4">
              <p className="text-sm text-charcoal font-semibold mb-1">
                Your {tierData.name} membership has expired.
              </p>
              <p className="text-xs text-gray-400 mb-5">
                Renew to keep your discount and perks active.
              </p>
              <button
                onClick={() => openLoyalty(tier)}
                className="bg-rose text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-rose/90 transition-colors"
              >
                Renew {tierData.name}
              </button>
            </div>
          )}

          {customer?.membership && membershipIsActive && customer.membership.tier !== 'platinum' && (
            <div className="mt-4 bg-white border border-blush/20 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm font-semibold text-charcoal">Want more perks?</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {customer.membership.tier === 'rose'
                    ? 'Upgrade to Gold or Platinum for bigger discounts and exclusive benefits.'
                    : 'Upgrade to Platinum for our top-tier VIP experience.'}
                </p>
              </div>
              <div className="flex gap-2">
                {customer.membership.tier === 'rose' && (
                  <button
                    onClick={() => openLoyalty('gold')}
                    className="bg-gold/20 text-charcoal border border-gold/40 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gold/30 transition-colors"
                  >
                    Upgrade to Gold
                  </button>
                )}
                <button
                  onClick={() => openLoyalty('platinum')}
                  className="bg-rose text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rose/90 transition-colors"
                >
                  Upgrade to Platinum
                </button>
              </div>
            </div>
          )}

          {!tier && (
            <div className="bg-white rounded-3xl p-8 border border-gray-100 text-center">
              <Sparkles size={28} className="mx-auto text-rose mb-3" />
              <h3 className="text-xl font-black text-charcoal mb-2">Join the Inner Circle</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                Members enjoy up to 15% off services and exclusive perks.
              </p>
              <button
                onClick={() => openLoyalty()}
                className="bg-rose text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-rose/90 transition-colors"
              >
                Explore Memberships
              </button>
            </div>
          )}
        </section>

        {/* BOOKINGS */}
        <section id="bookings">
          <h2 className="text-2xl font-black text-charcoal mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-rose" /> My Bookings
          </h2>
          {(() => {
            const visibleBookings = bookings.filter((b) => b.status !== 'cancelled')
            if (bookingsLoading) {
              return <p className="text-sm text-gray-500">Loading bookings…</p>
            }
            if (visibleBookings.length === 0) {
              return (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                  <p className="text-gray-400 text-sm mb-3">No bookings yet.</p>
                  <button
                    onClick={() => openBooking()}
                    className="text-rose font-bold text-sm uppercase tracking-widest hover:underline"
                  >
                    Browse Services →
                  </button>
                </div>
              )
            }
            return (
              <div className="space-y-3">
                {visibleBookings.map((b) => (
                <div
                  key={b.bookingId}
                  className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <p className="font-bold text-charcoal">{b.service}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {b.date} · {b.time}
                    </p>
                    <p className="text-sm text-gray-500">with {b.specialist}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                        statusStyles[b.status] ?? 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {b.status}
                    </span>
                    {cancellingId === b.bookingId ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 hidden sm:inline">Cancel this booking?</span>
                        <button
                          onClick={() => confirmCancel(b.bookingId)}
                          className="text-xs font-bold text-white bg-rose px-3 py-1.5 rounded-full uppercase tracking-widest"
                        >
                          Yes, Cancel
                        </button>
                        <button
                          onClick={() => setCancellingId(null)}
                          className="text-xs font-bold text-gray-400 uppercase tracking-widest"
                        >
                          Keep It
                        </button>
                      </div>
                    ) : (
                      b.status === 'upcoming' && (
                        <button
                          onClick={() => setCancellingId(b.bookingId)}
                          className="text-xs font-bold text-rose uppercase tracking-widest hover:underline"
                        >
                          Cancel
                        </button>
                      )
                    )}
                  </div>
                </div>
                ))}
              </div>
            )
          })()}
        </section>
        </div>
      </main>
      <Footer />
      <LoyaltyModal />
      <AuthModal />
      <BookingModal />
    </>
  )
}
