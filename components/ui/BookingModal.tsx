'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UserCircle, Check, Star } from 'lucide-react'
import { format, isBefore, isToday, startOfDay } from 'date-fns'
import { SERVICES } from '@/lib/services'
import { useBookingStore } from '@/lib/bookingStore'
import { useCustomer } from '@/lib/useCustomer'
import { useScrollLock } from '@/lib/useScrollLock'
import { Calendar } from '@/components/ui/Calendar'
import { cn } from '@/lib/utils'

const SPECIALISTS = [
  {
    name: 'Muna Sherpa',
    title: 'Senior All-Round Beautician',
    rating: 5.0,
    photo: '/specialists/muna.jpg',
  },
  {
    name: 'Sadaf Shaazadi',
    title: 'Hair Expert & Beauty Specialist',
    rating: 5.0,
    photo: '/specialists/sadaf.jpg',
  },
  {
    name: 'Devi Gajnayake',
    title: 'Nail Artist & Nail Care Specialist',
    rating: 5.0,
    photo: '/specialists/devi.jpg',
  },
]

const ADD_ONS = [
  {
    id: 'glow-boost',
    label: 'Express Glow Boost',
    description: '10-min LED facial — instant radiance before you walk out',
    price: 40,
    icon: '✨',
    badge: 'MOST LOVED' as string | null,
  },
  {
    id: 'head-massage',
    label: '15-Min Head & Shoulder Massage',
    description: 'Pure tension relief, added to any service',
    price: 30,
    icon: '💆‍♀️',
    badge: null as string | null,
  },
  {
    id: 'aromatherapy',
    label: 'Aromatherapy Upgrade',
    description: 'Calming essential oils woven into your service',
    price: 25,
    icon: '🌸',
    badge: null as string | null,
  },
  {
    id: 'nail-finish',
    label: 'Complimentary Nail Finish',
    description: 'A quick polish refresh — only 15 AED when added today',
    price: 15,
    icon: '💅',
    badge: 'TODAY ONLY' as string | null,
  },
]

export default function BookingModal() {
  const {
    bookingOpen,
    closeBooking,
    openAuth,
    setPendingBooking,
    preSelectedService,
  } = useBookingStore()
  const { customer } = useCustomer()
  const [step, setStep] = useState(1)
  const [serviceKey, setServiceKey] = useState<string | null>(null)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState<string | null>(null)
  const [specialist, setSpecialist] = useState<string | null>(null)
  const [addOns, setAddOns] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [categoryConfirmed, setCategoryConfirmed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [bookedTimes, setBookedTimes] = useState<string[]>([])

  useScrollLock(bookingOpen)

  useEffect(() => {
    if (!date) {
      setBookedTimes([])
      return
    }
    const dateStr = format(date, 'yyyy-MM-dd')
    const url = specialist
      ? `/api/bookings/availability?date=${dateStr}&specialist=${encodeURIComponent(specialist)}`
      : `/api/bookings/availability?date=${dateStr}`
    let cancelled = false
    fetch(url)
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
  }, [date, specialist])

  useEffect(() => {
    if (bookingOpen && preSelectedService) {
      setServiceKey(preSelectedService)
      setStep(1)
    }
  }, [bookingOpen, preSelectedService])

  const close = () => {
    closeBooking()
    setTimeout(() => {
      setStep(1)
      setServiceKey(null)
      setDate(undefined)
      setTime(null)
      setSpecialist(null)
      setAddOns([])
      setNotes('')
      setBookingId(null)
      setError(null)
      setCategoryConfirmed(false)
    }, 300)
  }

  const service = SERVICES.find((s) => s.key === serviceKey)

  const ALL_TIME_SLOTS = [
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00',
  ]

  const confirm = async () => {
    if (!service || !date || !time || !specialist) return
    setSubmitting(true)
    setError(null)
    try {
      const serviceLabel = service.label
      const finalPrice = null
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: serviceLabel,
          date: format(date, 'yyyy-MM-dd'),
          time,
          specialist,
          addOns,
          notes,
          price: finalPrice,
        }),
      })
      const data = await res.json()
      if (res.status === 409) {
        setError(data.error || 'This time slot is no longer available. Please choose a different time.')
        setTime(null)
        if (date) {
          const dateStr = format(date, 'yyyy-MM-dd')
          const url = specialist
            ? `/api/bookings/availability?date=${dateStr}&specialist=${encodeURIComponent(specialist)}`
            : `/api/bookings/availability?date=${dateStr}`
          const a = await fetch(url)
          if (a.ok) {
            const j = await a.json()
            setBookedTimes(j.bookedTimes ?? [])
          }
        }
        setStep(3)
        return
      }
      if (!res.ok) throw new Error(data.error || 'Could not create booking')
      setBookingId(data.bookingId)
      setStep(5)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {bookingOpen && (
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
              <div className="flex flex-col items-center text-center gap-6 p-12 min-h-[400px] justify-center">
                <UserCircle size={56} className="text-blush" />
                <h2 className="text-2xl font-black text-charcoal">Sign in to Book</h2>
                <p className="text-gray-400 text-sm max-w-xs">
                  Create a free account or sign in to book your experience and save your details for next time.
                </p>
                <button
                  onClick={() => {
                    closeBooking()
                    setPendingBooking(true)
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
            ) : (
              <>
                {/* HEADER */}
                <div className="shrink-0 p-8 pb-4">
                  <p className="text-rose text-xs font-bold uppercase tracking-[0.25em]">
                    ◆ Booking · Step {step} of 5
                  </p>
                  <div className="flex gap-1 mt-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <div
                        key={s}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          s <= step ? 'bg-rose' : 'bg-gray-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* MIDDLE — scrollable */}
                <div
                  className="flex-1 overflow-y-auto px-8 min-h-0"
                  data-lenis-prevent
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  {/* STEP 1 */}
                  {step === 1 &&
                    ((preSelectedService || categoryConfirmed) && service ? (
                      <div className="pb-4">
                        <p className="text-rose text-xs font-bold uppercase tracking-[0.25em] mb-1">
                          ◆ Booking · {service.label}
                        </p>
                        <h2 className="text-2xl font-black text-charcoal mb-2">
                          Choose your service
                        </h2>
                        <p className="text-sm text-gray-400 mb-4">
                          Select the exact service you'd like to book.
                        </p>
                        {!preSelectedService && (
                          <button
                            onClick={() => {
                              setCategoryConfirmed(false)
                              setServiceKey(null)
                            }}
                            className="text-xs font-bold text-rose uppercase tracking-widest mb-4 hover:underline"
                          >
                            ← Change category
                          </button>
                        )}
                        {customer?.membership && (
                          <div className="bg-dusty text-rose text-sm font-semibold px-4 py-2.5 rounded-xl mb-4 flex items-center gap-2">
                            <Check size={14} />
                            {customer.membership.discountPercent}% {customer.membership.tier} member
                            discount applied
                          </div>
                        )}
                        <div className="space-y-2">
                          {service.items.map((item) => {
                            const discountedPrice = customer?.membership
                              ? Math.round(item.price * (1 - customer.membership.discountPercent / 100))
                              : item.price
                            return (
                              <button
                                key={item.name}
                                onClick={() => {
                                  setServiceKey(serviceKey)
                                  setStep(2)
                                }}
                                className="w-full flex items-center justify-between p-4 rounded-xl border text-left transition-colors gap-3 border-gray-100 hover:border-blush/50"
                              >
                                <span className="text-sm font-medium text-charcoal">{item.name}</span>
                                <div className="text-right shrink-0">
                                  {customer?.membership ? (
                                    <>
                                      <span className="text-xs text-gray-400 line-through mr-2">{item.price} AED</span>
                                      <span className="text-sm font-bold text-rose">{discountedPrice} AED</span>
                                    </>
                                  ) : (
                                    <span className="text-sm font-bold text-rose">{item.price} AED</span>
                                  )}
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="pb-4">
                        <h2 className="text-2xl font-black text-charcoal mb-1">
                          Choose a service
                        </h2>
                        <p className="text-sm text-gray-500 mb-6">
                          Pick a category — you can fine-tune in the salon.
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {SERVICES.map((s) => (
                            <button
                              key={s.key}
                              onClick={() => setServiceKey(s.key)}
                              className={`text-left p-4 rounded-2xl border transition-colors ${
                                serviceKey === s.key
                                  ? 'border-rose bg-dusty'
                                  : 'border-gray-100 hover:border-blush'
                              }`}
                            >
                              <p className="text-sm font-bold text-charcoal">{s.label}</p>
                              <p className="text-xs text-rose mt-1">From {s.startingFrom} AED</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                  {/* STEP 3 */}
                  {step === 3 && (
                    <div className="pb-4">
                      <h2 className="text-2xl font-black text-charcoal mb-1">Pick a date & time</h2>
                      <p className="text-sm text-gray-500 mb-3">All times UAE standard time (GST+4).</p>
                      {service && (
                        <div className="bg-dusty text-rose text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full inline-flex items-center gap-2 mb-5">
                          <Check size={12} /> {service.label}
                        </div>
                      )}

                      <div className="bg-white border border-blush/20 rounded-2xl overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          <div className="p-5 md:flex-1">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              defaultMonth={date ?? new Date()}
                              disabled={(d) =>
                                (isBefore(d, startOfDay(new Date())) && !isToday(d)) ||
                                d.getDay() === 1
                              }
                            />
                          </div>

                          <div
                            className="flex flex-col gap-2 p-5 md:w-44 md:border-l border-t md:border-t-0 border-blush/20 overflow-y-auto"
                            style={{ maxHeight: 260 }}
                            data-lenis-prevent
                          >
                            {ALL_TIME_SLOTS.map((t) => {
                              const isBooked = bookedTimes.includes(t)
                              return (
                                <button
                                  key={t}
                                  disabled={isBooked}
                                  onClick={() => setTime(t)}
                                  title={isBooked ? 'Already booked' : undefined}
                                  className={cn(
                                    'w-full rounded-lg py-2.5 text-xs font-semibold transition-all',
                                    time === t
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
                            {date && time ? (
                              <>
                                Booked for{' '}
                                <span className="font-bold text-charcoal">
                                  {format(date, 'EEEE, d MMMM')}
                                </span>{' '}
                                at <span className="font-bold text-charcoal">{time}</span>
                              </>
                            ) : (
                              'Select a date and time to continue.'
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2 */}
                  {step === 2 && (
                    <div className="pb-4">
                      <h2 className="text-2xl font-black text-charcoal mb-1">
                        Choose your specialist
                      </h2>
                      <p className="text-sm text-gray-500 mb-6">All trained and certified.</p>
                      <div className="space-y-3">
                        {SPECIALISTS.map((sp) => (
                          <button
                            key={sp.name}
                            onClick={() => setSpecialist(sp.name)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-colors ${
                              specialist === sp.name
                                ? 'border-rose bg-dusty'
                                : 'border-gray-100 hover:border-blush'
                            }`}
                          >
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-rose text-white flex items-center justify-center font-bold flex-shrink-0 relative">
                              {sp.photo && (
                                <img
                                  src={sp.photo}
                                  alt={sp.name}
                                  className="absolute inset-0 w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              )}
                              <span className="text-sm">
                                {sp.name
                                  .split(' ')
                                  .map((s) => s[0])
                                  .join('')}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-charcoal">{sp.name}</p>
                              <p className="text-xs text-gray-500">{sp.title}</p>
                            </div>
                            <div className="flex items-center gap-1 text-gold text-sm">
                              <Star size={14} fill="currentColor" />
                              {sp.rating.toFixed(1)}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 4 */}
                  {step === 4 && (
                    <div className="pb-4">
                      <h2 className="text-2xl font-black text-charcoal mb-1">Just one more touch</h2>
                      <p className="text-sm text-gray-500 mb-6">
                        Personalize your visit. We will handle the rest.
                      </p>

                      <div className="bg-dusty rounded-xl px-4 py-3 mb-5 inline-flex items-center gap-2">
                        <Check size={14} className="text-rose" />
                        <p className="text-sm text-charcoal">
                          Booking as <strong>{customer.name}</strong>
                        </p>
                      </div>

                      <div className="bg-off-white rounded-2xl p-5 mb-5 space-y-2 text-sm">
                        <div className="flex justify-between gap-3">
                          <span className="text-gray-500 shrink-0">Service</span>
                          <span className="font-semibold text-right">{service?.label}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">When</span>
                          <span className="font-semibold">
                            {date && format(date, 'EEE d MMM')} · {time}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Specialist</span>
                          <span className="font-semibold">{specialist}</span>
                        </div>
                      </div>

                      <p className="text-sm font-bold text-charcoal mb-3">Add-ons</p>
                      <div className="space-y-3 mb-5">
                        {ADD_ONS.map((a) => {
                          const isSelected = addOns.includes(a.id)
                          return (
                            <button
                              type="button"
                              key={a.id}
                              onClick={() =>
                                setAddOns((prev) =>
                                  prev.includes(a.id)
                                    ? prev.filter((k) => k !== a.id)
                                    : [...prev, a.id]
                                )
                              }
                              className={`relative w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                                isSelected
                                  ? 'border-rose bg-dusty'
                                  : 'border-gray-100 hover:border-blush/40'
                              }`}
                            >
                              {a.badge && (
                                <span className="absolute -top-2 left-4 bg-rose text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                                  {a.badge}
                                </span>
                              )}
                              <div className="flex items-center gap-3">
                                <span className="text-xl">{a.icon}</span>
                                <div>
                                  <p className="text-sm font-semibold text-charcoal">{a.label}</p>
                                  <p className="text-xs text-gray-400 mt-0.5">{a.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-sm font-bold text-rose">
                                  +{a.price} AED
                                </span>
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    isSelected ? 'bg-rose border-rose' : 'border-gray-300'
                                  }`}
                                >
                                  {isSelected && <Check size={12} className="text-white" />}
                                </div>
                              </div>
                            </button>
                          )
                        })}
                      </div>

                      <p className="text-sm font-bold text-charcoal mb-2">Special requests</p>
                      <textarea
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Anything we should know?"
                        className="w-full bg-off-white border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose resize-none"
                      />

                      {error && (
                        <div className="mt-4 px-4 py-3 bg-rose/10 border border-rose/30 rounded-xl text-sm text-rose">
                          {error}
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 5 */}
                  {step === 5 && (
                    <div className="text-center py-8">
                      <motion.svg
                        width="80"
                        height="80"
                        viewBox="0 0 80 80"
                        className="mx-auto mb-6"
                      >
                        <motion.circle
                          cx="40"
                          cy="40"
                          r="36"
                          fill="none"
                          stroke="#C4768A"
                          strokeWidth="3"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.6 }}
                        />
                        <motion.path
                          d="M24 42 L36 54 L56 30"
                          fill="none"
                          stroke="#C4768A"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ delay: 0.5, duration: 0.4 }}
                        />
                      </motion.svg>
                      <h2 className="text-3xl font-black text-charcoal mb-2">You're booked.</h2>
                      <p className="text-sm text-gray-500 mb-6">
                        Confirmation #{bookingId} sent to {customer.email}.
                      </p>
                      <div className="bg-off-white rounded-2xl p-5 mb-6 text-left space-y-2 text-sm max-w-sm mx-auto">
                        <div className="flex justify-between gap-3">
                          <span className="text-gray-500 shrink-0">Service</span>
                          <span className="font-semibold text-right">{service?.label}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">When</span>
                          <span className="font-semibold">
                            {date && format(date, 'EEE d MMM')} · {time}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Specialist</span>
                          <span className="font-semibold">{specialist}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* FOOTER */}
                <div className="shrink-0 p-6 pt-4 border-t border-gray-50">
                  {step === 1 && !preSelectedService && !categoryConfirmed && (
                    <div className="flex justify-end">
                      <button
                        disabled={!serviceKey}
                        onClick={() => setCategoryConfirmed(true)}
                        className="bg-rose text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest disabled:opacity-40 hover:bg-rose/90 transition-colors"
                      >
                        Continue
                      </button>
                    </div>
                  )}
                  {step === 2 && (
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setStep(1)}
                        className="text-sm text-gray-500 hover:text-charcoal"
                      >
                        ← Back
                      </button>
                      <button
                        disabled={!specialist}
                        onClick={() => setStep(3)}
                        className="bg-rose text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest disabled:opacity-40 hover:bg-rose/90 transition-colors"
                      >
                        Continue
                      </button>
                    </div>
                  )}
                  {step === 3 && (
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          setDate(undefined)
                          setTime(null)
                          setBookedTimes([])
                          setStep(2)
                        }}
                        className="text-sm text-gray-500 hover:text-charcoal"
                      >
                        ← Back
                      </button>
                      <button
                        disabled={!date || !time}
                        onClick={() => setStep(4)}
                        className="bg-rose text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest disabled:opacity-40 hover:bg-rose/90 transition-colors"
                      >
                        Continue
                      </button>
                    </div>
                  )}
                  {step === 4 && (
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setStep(3)}
                        className="text-sm text-gray-500 hover:text-charcoal"
                      >
                        ← Back
                      </button>
                      <button
                        disabled={submitting}
                        onClick={confirm}
                        className="bg-rose text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest disabled:opacity-40 hover:bg-rose/90 transition-colors"
                      >
                        {submitting ? 'Confirming…' : 'Confirm Booking'}
                      </button>
                    </div>
                  )}
                  {step === 5 && (
                    <div className="flex justify-center">
                      <button
                        onClick={close}
                        className="bg-rose text-white px-10 py-3 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-rose/90 transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
