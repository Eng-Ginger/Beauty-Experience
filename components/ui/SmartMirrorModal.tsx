'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UserCircle, Sparkles, MessageCircle, Check } from 'lucide-react'
import { format, isBefore, startOfDay } from 'date-fns'
import { useBookingStore } from '@/lib/bookingStore'
import { useCustomer } from '@/lib/useCustomer'
import { useScrollLock } from '@/lib/useScrollLock'
import { Calendar } from '@/components/ui/Calendar'
import { cn } from '@/lib/utils'

const TIME_SLOTS = [
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00',
]

const CONCERNS = [
  'Dryness',
  'Acne',
  'Redness',
  'Aging',
  'Pigmentation',
  'Sensitivity',
  'Oiliness',
  'Pore Size',
]

const REFERRALS = ['Instagram', 'TikTok', 'Friend', 'Google', 'Walked Past', 'Other']

export default function SmartMirrorModal() {
  const { mirrorOpen, closeMirror, openAuth, setPendingBooking } = useBookingStore()
  const { customer } = useCustomer()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    concerns: [] as string[],
    referral: '',
  })
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [bookedTimes, setBookedTimes] = useState<string[]>([])

  useScrollLock(mirrorOpen)

  useEffect(() => {
    if (!selectedDate) {
      setBookedTimes([])
      return
    }
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    let cancelled = false
    fetch(`/api/bookings/availability?date=${dateStr}`)
      .then((r) => (r.ok ? r.json() : { bookedTimes: [] }))
      .then((d) => {
        if (!cancelled) setBookedTimes(d.bookedTimes ?? [])
      })
      .catch(() => {
        if (!cancelled) setBookedTimes([])
      })
    return () => {
      cancelled = true
    }
  }, [selectedDate])

  useEffect(() => {
    if (customer && mirrorOpen) {
      setForm((f) => ({
        ...f,
        name: customer.name,
        email: customer.email,
        phone: customer.phone ?? '+971',
      }))
    }
  }, [customer, mirrorOpen])

  const close = () => {
    closeMirror()
    setTimeout(() => {
      setStep(1)
      setBookingId(null)
      setError(null)
      setSelectedDate(undefined)
      setSelectedTime(null)
    }, 300)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !selectedTime) {
      setError('Please pick a date and time.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/mirror-booking', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: selectedTime,
        }),
      })
      const data = await res.json()
      if (res.status === 409) {
        setError('This time slot is already booked. Please select a different time.')
        setSelectedTime(null)
        if (selectedDate) {
          const dateStr = format(selectedDate, 'yyyy-MM-dd')
          const a = await fetch(`/api/bookings/availability?date=${dateStr}`)
          if (a.ok) {
            const j = await a.json()
            setBookedTimes(j.bookedTimes ?? [])
          }
        }
        return
      }
      if (!res.ok) throw new Error(data.error || 'Could not book')
      setBookingId(data.bookingId)
      setStep(2)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {mirrorOpen && (
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
            className="relative max-w-xl w-full bg-white rounded-3xl shadow-2xl flex flex-col"
            style={{ maxHeight: '90vh' }}
          >
            <button
              onClick={close}
              aria-label="Close"
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <X size={18} />
            </button>

            {!customer ? (
              <div className="flex flex-col items-center text-center gap-6 p-12">
                <UserCircle size={56} className="text-blush" />
                <h2 className="text-2xl font-black text-charcoal">Sign in to Book</h2>
                <p className="text-gray-400 text-sm max-w-xs">
                  Sign in so we can save your Smart Mirror analysis to your profile.
                </p>
                <button
                  onClick={() => {
                    closeMirror()
                    setPendingBooking(false)
                    setTimeout(() => openAuth(), 150)
                  }}
                  className="w-full max-w-xs bg-rose text-white rounded-full py-4 font-bold text-sm uppercase tracking-widest"
                >
                  Sign In / Create Account
                </button>
              </div>
            ) : step === 1 ? (
              <form onSubmit={submit} className="flex flex-col flex-1 min-h-0">
                {/* HEADER */}
                <div className="shrink-0 p-8 pb-4">
                  <p className="text-rose text-xs font-bold uppercase tracking-[0.25em] mb-2">
                    ◆ AI Smart Mirror
                  </p>
                  <h2 className="text-2xl font-black text-charcoal mb-1">Book your analysis</h2>
                  <p className="text-sm text-gray-500">
                    A 15-minute session. Free, no booking fee.
                  </p>
                </div>

                {/* MIDDLE — scrollable */}
                <div
                  className="flex-1 overflow-y-auto px-8 min-h-0"
                  data-lenis-prevent
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  <div className="bg-dusty text-rose text-sm font-semibold px-4 py-2 rounded-full inline-flex items-center gap-2 mb-5">
                    <Check size={14} /> Booking as {customer.name}
                  </div>

                  <div className="bg-white border border-blush/20 rounded-2xl overflow-hidden mb-5">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-5 md:flex-1">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          defaultMonth={selectedDate ?? new Date()}
                          disabled={(d) => isBefore(d, startOfDay(new Date())) || d.getDay() === 1}
                        />
                      </div>
                      <div
                        className="flex flex-col gap-2 p-5 md:w-44 md:border-l border-t md:border-t-0 border-blush/20 overflow-y-auto"
                        style={{ maxHeight: 260 }}
                        data-lenis-prevent
                      >
                        {TIME_SLOTS.map((t) => {
                          const isBooked = bookedTimes.includes(t)
                          return (
                            <button
                              type="button"
                              key={t}
                              disabled={isBooked}
                              onClick={() => setSelectedTime(t)}
                              title={isBooked ? 'Already booked' : undefined}
                              className={cn(
                                'w-full rounded-lg py-2.5 text-xs font-semibold transition-all',
                                selectedTime === t
                                  ? 'bg-rose text-white shadow-sm'
                                  : isBooked
                                  ? 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed line-through'
                                  : 'bg-white text-charcoal border border-gray-100 hover:border-blush/50'
                              )}
                            >
                              {t}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    <div className="border-t border-blush/20 px-5 py-4 bg-white">
                      <p className="text-sm text-gray-500">
                        {selectedDate && selectedTime ? (
                          <>
                            Reserved for{' '}
                            <span className="font-bold text-charcoal">
                              {format(selectedDate, 'EEEE, d MMMM')}
                            </span>{' '}
                            at <span className="font-bold text-charcoal">{selectedTime}</span>
                          </>
                        ) : (
                          'Select a date and time to continue.'
                        )}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm font-bold text-charcoal mb-2">Skin concerns</p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {CONCERNS.map((c) => {
                      const active = form.concerns.includes(c)
                      return (
                        <button
                          type="button"
                          key={c}
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              concerns: active
                                ? f.concerns.filter((x) => x !== c)
                                : [...f.concerns, c],
                            }))
                          }
                          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${
                            active ? 'bg-rose text-white' : 'bg-off-white text-charcoal/70'
                          }`}
                        >
                          {c}
                        </button>
                      )
                    })}
                  </div>

                  <p className="text-sm font-bold text-charcoal mb-2">How did you hear about us?</p>
                  <select
                    required
                    value={form.referral}
                    onChange={(e) => setForm({ ...form, referral: e.target.value })}
                    className="w-full bg-off-white border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose mb-4"
                  >
                    <option value="">Select…</option>
                    {REFERRALS.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>

                  {error && (
                    <div className="mb-2 px-4 py-3 bg-rose/10 border border-rose/30 rounded-xl text-sm text-rose">
                      {error}
                    </div>
                  )}
                </div>

                {/* FOOTER */}
                <div className="shrink-0 p-6 pt-4 border-t border-gray-50">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-rose text-white py-3.5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-rose/90 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Booking…' : 'Book My Session'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div
                  className="flex-1 overflow-y-auto p-10 text-center min-h-0"
                  data-lenis-prevent
                >
                  <div className="w-16 h-16 mx-auto rounded-full bg-rose/10 flex items-center justify-center mb-4">
                    <Sparkles size={28} className="text-rose" />
                  </div>
                  <h2 className="text-3xl font-black text-charcoal mb-2">You're booked.</h2>
                  <p className="text-sm text-gray-500">
                    Reference #{bookingId}. We'll WhatsApp you a confirmation.
                  </p>
                </div>
                <div className="shrink-0 p-6 pt-4 border-t border-gray-50 flex justify-center">
                  <a
                    href="https://api.whatsapp.com/send?phone=971522325578"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-rose text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-rose/90 transition-colors"
                  >
                    <MessageCircle size={16} /> Continue on WhatsApp
                  </a>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
