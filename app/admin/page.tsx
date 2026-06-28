'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { format } from 'date-fns'

type TabKey = 'bookings' | 'calendar' | 'mirror_bookings' | 'customers' | 'loyalty_members'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'bookings', label: 'Bookings' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'mirror_bookings', label: 'Mirror Bookings' },
  { key: 'customers', label: 'Customers' },
  { key: 'loyalty_members', label: 'Loyalty Members' },
]

const TIER_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  rose: { bg: '#FADADD', color: '#A85070', label: 'ROSE' },
  gold: { bg: '#F1E2BC', color: '#8B6914', label: 'GOLD' },
  platinum: { bg: '#E3DCEC', color: '#5B4B7A', label: 'PLATINUM' },
}

const STATUS_BADGE = (status: string) => {
  const s = (status ?? '').toLowerCase()
  if (s === 'upcoming' || s === 'active') return { bg: '#FADADD', color: '#A85070' }
  if (s === 'pending') return { bg: '#FEF3C7', color: '#92400E' }
  if (s === 'revoked' || s === 'cancelled') return { bg: '#E5E7EB', color: '#6B7280' }
  if (s === 'upgraded') return { bg: '#DBEAFE', color: '#1E40AF' }
  return { bg: '#E5E7EB', color: '#6B7280' }
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loggingIn, setLoggingIn] = useState(false)

  const [tab, setTab] = useState<TabKey>('bookings')
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Filters
  const [bookingStatus, setBookingStatus] = useState<'all' | 'upcoming' | 'cancelled'>('all')
  const [fromDate, setFromDate] = useState<Date | null>(null)
  const [toDate, setToDate] = useState<Date | null>(null)
  const [showFromPicker, setShowFromPicker] = useState(false)
  const [showToPicker, setShowToPicker] = useState(false)
  const fromPickerRef = useRef<HTMLDivElement | null>(null)
  const toPickerRef = useRef<HTMLDivElement | null>(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [loyaltyTier, setLoyaltyTier] = useState<'all' | 'rose' | 'gold' | 'platinum'>('all')
  const [loyaltyStatus, setLoyaltyStatus] = useState<'all' | 'active' | 'pending' | 'revoked'>('all')

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'booking' | 'customer' | 'mirror_booking' | 'loyalty_member'
    id: string
  } | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Bulk delete
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showBulkConfirm, setShowBulkConfirm] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)

  // Grant form
  const [grantEmail, setGrantEmail] = useState('')
  const [grantTier, setGrantTier] = useState<'rose' | 'gold' | 'platinum'>('rose')
  const [granting, setGranting] = useState(false)
  const [grantMsg, setGrantMsg] = useState<string | null>(null)

  const loadTable = useCallback(
    async (key: TabKey, pw: string) => {
      setLoading(true)
      setFetchError(null)
      try {
        const r = await fetch(`/api/admin/data?table=${key}`, {
          headers: { authorization: `Bearer ${pw}` },
        })
        if (r.status === 401) {
          sessionStorage.removeItem('adminPassword')
          setAuthed(false)
          setPassword('')
          setLoginError('Session expired — please sign in again.')
          return
        }
        if (!r.ok) {
          const e = await r.json().catch(() => ({}))
          throw new Error(e.error || `Failed (${r.status})`)
        }
        const d = await r.json()
        setRows(d.rows ?? [])
      } catch (err: any) {
        setFetchError(err.message)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    const stored = sessionStorage.getItem('adminPassword')
    if (stored) {
      setPassword(stored)
      setAuthed(true)
    }
    setAuthChecked(true)
  }, [])

  useEffect(() => {
    if (authed && password) {
      const apiKey: TabKey = tab === 'calendar' ? 'bookings' : tab
      loadTable(apiKey, password)
    }
  }, [authed, password, tab, loadTable])

  useEffect(() => {
    setSelectedIds(new Set())
  }, [tab])

  const toggleId = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = (ids: string[]) => {
    setSelectedIds((prev) => {
      if (ids.length > 0 && ids.every((id) => prev.has(id))) return new Set()
      return new Set(ids)
    })
  }

  const handleBulkDelete = async () => {
    setBulkDeleting(true)
    try {
      const type =
        tab === 'mirror_bookings'
          ? 'mirror_booking'
          : tab === 'loyalty_members'
          ? 'loyalty_member'
          : tab === 'customers'
          ? 'customer'
          : 'booking'
      const ids = Array.from(selectedIds)
      await Promise.all(
        ids.map((id) =>
          fetch('/api/admin/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, id, adminPassword: password }),
          })
        )
      )
      const idKey =
        tab === 'customers'
          ? 'customer_id'
          : tab === 'loyalty_members'
          ? 'membership_id'
          : 'booking_id'
      setRows((prev) => prev.filter((row) => !selectedIds.has(row[idKey])))
      setSelectedIds(new Set())
      setShowBulkConfirm(false)
    } finally {
      setBulkDeleting(false)
    }
  }

  useEffect(() => {
    if (!showFromPicker && !showToPicker) return
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node
      if (showFromPicker && fromPickerRef.current && !fromPickerRef.current.contains(t)) {
        setShowFromPicker(false)
      }
      if (showToPicker && toPickerRef.current && !toPickerRef.current.contains(t)) {
        setShowToPicker(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [showFromPicker, showToPicker])

  const handleLogin = async () => {
    if (!password) return
    setLoggingIn(true)
    setLoginError(null)
    try {
      const r = await fetch(`/api/admin/data?table=bookings`, {
        headers: { authorization: `Bearer ${password}` },
      })
      if (r.status === 429) {
        setLoginError('Too many attempts. Try again later.')
        return
      }
      if (!r.ok) {
        setLoginError('Incorrect password.')
        return
      }
      sessionStorage.setItem('adminPassword', password)
      setAuthed(true)
    } finally {
      setLoggingIn(false)
    }
  }

  const handleSignOut = () => {
    sessionStorage.removeItem('adminPassword')
    setAuthed(false)
    setPassword('')
    setRows([])
  }

  const handleGrant = async () => {
    if (!grantEmail) return
    setGranting(true)
    setGrantMsg(null)
    try {
      const r = await fetch('/api/admin/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: grantEmail, tier: grantTier, adminPassword: password }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Grant failed')
      setGrantMsg(`✓ Granted ${grantTier} to ${grantEmail}`)
      setGrantEmail('')
      await loadTable('loyalty_members', password)
    } catch (err: any) {
      setGrantMsg(err.message)
    } finally {
      setGranting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const r = await fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: deleteTarget.type,
          id: deleteTarget.id,
          adminPassword: password,
        }),
      })
      if (r.ok) {
        setRows((prev) => {
          if (deleteTarget.type === 'customer') {
            return prev.filter((row) => row.customer_id !== deleteTarget.id)
          }
          if (deleteTarget.type === 'loyalty_member') {
            return prev.filter((row) => row.membership_id !== deleteTarget.id)
          }
          return prev.filter((row) => row.booking_id !== deleteTarget.id)
        })
        setDeleteTarget(null)
      }
    } finally {
      setDeleting(false)
    }
  }

  const handleRevoke = async (membershipId: string) => {
    if (!confirm(`Revoke membership ${membershipId}?`)) return
    const r = await fetch('/api/admin/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ membershipId, adminPassword: password }),
    })
    if (r.ok) await loadTable('loyalty_members', password)
  }

  const filteredRows = useMemo(() => {
    if (tab === 'bookings') {
      return rows.filter((r) => {
        if (bookingStatus !== 'all' && (r.status ?? '').toLowerCase() !== bookingStatus) return false
        if (r.date) {
          const d = new Date(r.date)
          if (fromDate && d < fromDate) return false
          if (toDate && d > toDate) return false
        }
        return true
      })
    }
    if (tab === 'customers') {
      const q = customerSearch.trim().toLowerCase()
      if (!q) return rows
      return rows.filter(
        (r) =>
          (r.name ?? '').toLowerCase().includes(q) ||
          (r.email ?? '').toLowerCase().includes(q)
      )
    }
    if (tab === 'loyalty_members') {
      return rows.filter((r) => {
        if (loyaltyTier !== 'all' && r.tier !== loyaltyTier) return false
        if (loyaltyStatus !== 'all' && (r.status ?? '').toLowerCase() !== loyaltyStatus) return false
        return true
      })
    }
    return rows
  }, [rows, tab, bookingStatus, fromDate, toDate, customerSearch, loyaltyTier, loyaltyStatus])

  if (!authChecked) {
    return <main style={{ backgroundColor: '#0D0D0D', minHeight: '100vh' }} />
  }

  if (!authed) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: '#0D0D0D' }}
      >
        <div className="bg-white rounded-3xl p-10 w-full max-w-sm shadow-xl">
          <h1 className="text-2xl font-black mb-2" style={{ color: '#1A1A1A' }}>
            Admin Access
          </h1>
          <p className="text-sm mb-6" style={{ color: '#9CA3AF' }}>
            Beauty Experience — Internal Dashboard
          </p>
          <input
            type="password"
            placeholder="Enter admin password"
            className="w-full border rounded-xl px-4 py-3 text-sm mb-4 outline-none"
            style={{ borderColor: '#E8D5DA' }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            autoFocus
          />
          {loginError && (
            <p className="text-xs mb-3" style={{ color: '#C4768A' }}>
              {loginError}
            </p>
          )}
          <button
            onClick={handleLogin}
            disabled={loggingIn || !password}
            className="w-full rounded-full py-3 font-semibold text-white text-sm disabled:opacity-50"
            style={{ backgroundColor: '#A85070' }}
          >
            {loggingIn ? 'Verifying…' : 'Sign In'}
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <header
        className="sticky top-0 z-30 px-6 md:px-10 py-4 flex items-center justify-between border-b"
        style={{ backgroundColor: '#0D0D0D', borderColor: '#1A1A1A' }}
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: '#C4768A' }}>
            ◆ Admin
          </p>
          <h1 className="text-base md:text-lg font-black text-white">
            Beauty Experience — Admin
          </h1>
        </div>
        <button
          onClick={handleSignOut}
          className="text-xs font-bold uppercase tracking-widest border border-white/20 hover:border-white text-white px-4 py-2 rounded-full"
        >
          Sign Out
        </button>
      </header>

      {/* Tabs */}
      <nav className="px-6 md:px-10 pt-6 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest"
              style={{
                backgroundColor: active ? '#A85070' : '#FFFFFF',
                color: active ? '#FFFFFF' : '#1A1A1A',
                border: active ? '1px solid #A85070' : '1px solid #E5E7EB',
              }}
            >
              {t.label}
            </button>
          )
        })}
      </nav>

      <section className="px-6 md:px-10 py-6">
        {/* Filters row (hidden on calendar) */}
        {tab !== 'calendar' && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {tab === 'bookings' && (
            <>
              <select
                value={bookingStatus}
                onChange={(e) => setBookingStatus(e.target.value as any)}
                className="border rounded-lg px-3 py-2 text-sm outline-none bg-white"
                style={{ borderColor: '#E5E7EB' }}
              >
                <option value="all">All Statuses</option>
                <option value="upcoming">Upcoming</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <div ref={fromPickerRef} className="relative">
                <button
                  onClick={() => {
                    setShowFromPicker((v) => !v)
                    setShowToPicker(false)
                  }}
                  className="rounded-full px-4 py-2 text-sm border"
                  style={{
                    borderColor: '#E8D5DA',
                    backgroundColor: '#FFFFFF',
                    color: fromDate ? '#1A1A1A' : '#9CA3AF',
                  }}
                >
                  {fromDate ? format(fromDate, 'dd MMM yyyy') : 'From date'}
                </button>
                {showFromPicker && (
                  <div
                    className="absolute top-12 left-0 z-50 bg-white rounded-2xl shadow-xl border p-3"
                    style={{ borderColor: '#E8D5DA' }}
                  >
                    <DayPicker
                      mode="single"
                      selected={fromDate ?? undefined}
                      onSelect={(d) => {
                        setFromDate(d ?? null)
                        setShowFromPicker(false)
                      }}
                      modifiersStyles={{
                        selected: { backgroundColor: '#C4768A', color: '#fff' },
                        today: { color: '#C4768A', fontWeight: 'bold' },
                      }}
                    />
                    {fromDate && (
                      <button
                        onClick={() => setFromDate(null)}
                        className="text-xs w-full text-center mt-1"
                        style={{ color: '#C4768A' }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div ref={toPickerRef} className="relative">
                <button
                  onClick={() => {
                    setShowToPicker((v) => !v)
                    setShowFromPicker(false)
                  }}
                  className="rounded-full px-4 py-2 text-sm border"
                  style={{
                    borderColor: '#E8D5DA',
                    backgroundColor: '#FFFFFF',
                    color: toDate ? '#1A1A1A' : '#9CA3AF',
                  }}
                >
                  {toDate ? format(toDate, 'dd MMM yyyy') : 'To date'}
                </button>
                {showToPicker && (
                  <div
                    className="absolute top-12 left-0 z-50 bg-white rounded-2xl shadow-xl border p-3"
                    style={{ borderColor: '#E8D5DA' }}
                  >
                    <DayPicker
                      mode="single"
                      selected={toDate ?? undefined}
                      onSelect={(d) => {
                        setToDate(d ?? null)
                        setShowToPicker(false)
                      }}
                      modifiersStyles={{
                        selected: { backgroundColor: '#C4768A', color: '#fff' },
                        today: { color: '#C4768A', fontWeight: 'bold' },
                      }}
                    />
                    {toDate && (
                      <button
                        onClick={() => setToDate(null)}
                        className="text-xs w-full text-center mt-1"
                        style={{ color: '#C4768A' }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
          {tab === 'customers' && (
            <input
              type="search"
              placeholder="Search name or email…"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm outline-none bg-white min-w-[240px]"
              style={{ borderColor: '#E5E7EB' }}
            />
          )}
          {tab === 'loyalty_members' && (
            <>
              <select
                value={loyaltyTier}
                onChange={(e) => setLoyaltyTier(e.target.value as any)}
                className="border rounded-lg px-3 py-2 text-sm outline-none bg-white"
                style={{ borderColor: '#E5E7EB' }}
              >
                <option value="all">All Tiers</option>
                <option value="rose">Rose</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
              </select>
              <select
                value={loyaltyStatus}
                onChange={(e) => setLoyaltyStatus(e.target.value as any)}
                className="border rounded-lg px-3 py-2 text-sm outline-none bg-white"
                style={{ borderColor: '#E5E7EB' }}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="revoked">Revoked</option>
              </select>
            </>
          )}
          <p className="ml-auto text-xs uppercase tracking-widest" style={{ color: '#6B7280' }}>
            {filteredRows.length}{' '}
            {tab === 'bookings'
              ? 'bookings'
              : tab === 'mirror_bookings'
              ? 'mirror bookings'
              : tab === 'customers'
              ? 'customers'
              : 'members'}
          </p>
        </div>
        )}

        {/* Grant form — only on loyalty tab */}
        {tab === 'loyalty_members' && (
          <div className="bg-white border rounded-2xl p-5 mb-4" style={{ borderColor: '#E5E7EB' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#1A1A1A' }}>
              Grant Membership
            </p>
            <div className="flex flex-wrap gap-3 items-center">
              <input
                type="email"
                placeholder="Customer email"
                value={grantEmail}
                onChange={(e) => setGrantEmail(e.target.value)}
                className="flex-1 min-w-[240px] border rounded-lg px-3 py-2 text-sm outline-none bg-white"
                style={{ borderColor: '#E5E7EB' }}
              />
              <select
                value={grantTier}
                onChange={(e) => setGrantTier(e.target.value as any)}
                className="border rounded-lg px-3 py-2 text-sm outline-none bg-white"
                style={{ borderColor: '#E5E7EB' }}
              >
                <option value="rose">Rose</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
              </select>
              <button
                onClick={handleGrant}
                disabled={granting || !grantEmail}
                className="rounded-lg px-5 py-2 text-sm font-bold text-white disabled:opacity-40"
                style={{ backgroundColor: '#A85070' }}
              >
                {granting ? 'Granting…' : 'Grant'}
              </button>
            </div>
            {grantMsg && (
              <p className="mt-3 text-xs" style={{ color: '#6B7280' }}>
                {grantMsg}
              </p>
            )}
          </div>
        )}

        {/* Bulk-delete toolbar (hidden on calendar) */}
        {selectedIds.size > 0 && tab !== 'calendar' && (
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="text-sm" style={{ color: '#6B7280' }}>
              {selectedIds.size} selected
            </span>
            <button
              onClick={() => setShowBulkConfirm(true)}
              className="px-4 py-2 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: '#A85070' }}
            >
              Delete Selected ({selectedIds.size})
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-4 py-2 rounded-full text-sm border"
              style={{ borderColor: '#E5E7EB', color: '#6B7280' }}
            >
              Clear
            </button>
          </div>
        )}

        {tab === 'calendar' ? (
          fetchError ? (
            <p className="p-6 text-sm" style={{ color: '#C4768A' }}>
              {fetchError}
            </p>
          ) : loading ? (
            <p className="p-6 text-sm" style={{ color: '#6B7280' }}>
              Loading…
            </p>
          ) : (
            <CalendarView bookings={rows} />
          )
        ) : (
          /* Table */
          <div
            className="bg-white rounded-2xl border overflow-hidden"
            style={{ borderColor: '#E5E7EB' }}
          >
            <div className="overflow-x-auto">
              {fetchError ? (
                <p className="p-6 text-sm" style={{ color: '#C4768A' }}>
                  {fetchError}
                </p>
              ) : loading ? (
                <p className="p-6 text-sm" style={{ color: '#6B7280' }}>
                  Loading…
                </p>
              ) : filteredRows.length === 0 ? (
                <p className="p-6 text-sm" style={{ color: '#6B7280' }}>
                  No rows.
                </p>
              ) : tab === 'bookings' ? (
                <BookingsTable
                  rows={filteredRows}
                  selectedIds={selectedIds}
                  toggleId={toggleId}
                  toggleAll={toggleAll}
                  onDelete={(id) => setDeleteTarget({ type: 'booking', id })}
                />
              ) : tab === 'mirror_bookings' ? (
                <MirrorTable
                  rows={filteredRows}
                  selectedIds={selectedIds}
                  toggleId={toggleId}
                  toggleAll={toggleAll}
                  onDelete={(id) => setDeleteTarget({ type: 'mirror_booking', id })}
                />
              ) : tab === 'customers' ? (
                <CustomersTable
                  rows={filteredRows}
                  selectedIds={selectedIds}
                  toggleId={toggleId}
                  toggleAll={toggleAll}
                  onDelete={(id) => setDeleteTarget({ type: 'customer', id })}
                />
              ) : (
                <LoyaltyTable
                  rows={filteredRows}
                  selectedIds={selectedIds}
                  toggleId={toggleId}
                  toggleAll={toggleAll}
                  onRevoke={handleRevoke}
                  onDelete={(id) => setDeleteTarget({ type: 'loyalty_member', id })}
                />
              )}
            </div>
          </div>
        )}
      </section>

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-black mb-2" style={{ color: '#1A1A1A' }}>
              Confirm Delete
            </h3>
            <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
              Are you sure you want to permanently delete this{' '}
              {deleteTarget.type.replace('_', ' ')}? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 rounded-full py-3 text-sm font-semibold border"
                style={{ borderColor: '#E8D5DA', color: '#6B7280' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-full py-3 text-sm font-semibold text-white disabled:opacity-60"
                style={{ backgroundColor: '#C4768A' }}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-black mb-2" style={{ color: '#1A1A1A' }}>
              Delete {selectedIds.size} items?
            </h3>
            <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
              This will permanently delete {selectedIds.size} selected{' '}
              {tab.replace('_', ' ')}. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkConfirm(false)}
                disabled={bulkDeleting}
                className="flex-1 rounded-full py-3 text-sm font-semibold border"
                style={{ borderColor: '#E5E7EB', color: '#6B7280' }}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="flex-1 rounded-full py-3 text-sm font-semibold text-white disabled:opacity-60"
                style={{ backgroundColor: '#A85070' }}
              >
                {bulkDeleting ? 'Deleting…' : `Delete ${selectedIds.size}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th
      className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest whitespace-nowrap"
      style={{ color: '#6B7280', backgroundColor: '#F9FAFB' }}
    >
      {children}
    </th>
  )
}

function Td({ children, mono }: { children?: React.ReactNode; mono?: boolean }) {
  return (
    <td
      className={`px-4 py-3 text-sm align-top ${mono ? 'font-mono text-xs' : ''}`}
      style={{ color: '#1A1A1A' }}
    >
      {children ?? <span style={{ color: '#9CA3AF' }}>—</span>}
    </td>
  )
}

function Badge({ children, bg, color }: { children: React.ReactNode; bg: string; color: string }) {
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
      style={{ backgroundColor: bg, color }}
    >
      {children}
    </span>
  )
}

function fmt(value: any) {
  if (value == null || value === '') return null
  return String(value)
}

function BookingsTable({
  rows,
  selectedIds,
  toggleId,
  toggleAll,
  onDelete,
}: {
  rows: any[]
  selectedIds: Set<string>
  toggleId: (id: string) => void
  toggleAll: (ids: string[]) => void
  onDelete: (id: string) => void
}) {
  const ids = rows.map((r) => r.booking_id)
  const allSelected = ids.length > 0 && ids.every((id) => selectedIds.has(id))
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th className="px-4 py-3 w-10" style={{ backgroundColor: '#F9FAFB' }}>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => toggleAll(ids)}
              className="rounded"
              style={{ accentColor: '#A85070' }}
            />
          </th>
          <Th>Booking ID</Th>
          <Th>Customer</Th>
          <Th>Service</Th>
          <Th>Date</Th>
          <Th>Time</Th>
          <Th>Specialist</Th>
          <Th>Price</Th>
          <Th>Status</Th>
          <Th>Add-ons</Th>
          <Th></Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const badge = STATUS_BADGE(r.status)
          return (
            <tr key={r.booking_id ?? i} style={{ backgroundColor: i % 2 === 1 ? '#FAFAFA' : '#FFFFFF' }}>
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(r.booking_id)}
                  onChange={() => toggleId(r.booking_id)}
                  className="rounded"
                  style={{ accentColor: '#A85070' }}
                />
              </td>
              <Td mono>{r.booking_id}</Td>
              <Td>{r.customer_name}</Td>
              <Td>{r.service}</Td>
              <Td>{r.date}</Td>
              <Td>{r.time}</Td>
              <Td>{r.specialist}</Td>
              <Td>{r.price != null ? `${r.price} AED` : null}</Td>
              <Td>
                <Badge bg={badge.bg} color={badge.color}>
                  {String(r.status ?? '').toUpperCase() || '—'}
                </Badge>
              </Td>
              <Td>{Array.isArray(r.add_ons) && r.add_ons.length > 0 ? r.add_ons.join(', ') : null}</Td>
              <Td>
                <DeleteButton onClick={() => onDelete(r.booking_id)} />
              </Td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function MirrorTable({
  rows,
  selectedIds,
  toggleId,
  toggleAll,
  onDelete,
}: {
  rows: any[]
  selectedIds: Set<string>
  toggleId: (id: string) => void
  toggleAll: (ids: string[]) => void
  onDelete: (id: string) => void
}) {
  const ids = rows.map((r) => r.booking_id)
  const allSelected = ids.length > 0 && ids.every((id) => selectedIds.has(id))
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th className="px-4 py-3 w-10" style={{ backgroundColor: '#F9FAFB' }}>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => toggleAll(ids)}
              className="rounded"
              style={{ accentColor: '#A85070' }}
            />
          </th>
          <Th>Booking ID</Th>
          <Th>Name</Th>
          <Th>Phone</Th>
          <Th>Email</Th>
          <Th>Date</Th>
          <Th>Time</Th>
          <Th>Skin Concerns</Th>
          <Th>Referral</Th>
          <Th></Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.booking_id ?? i} style={{ backgroundColor: i % 2 === 1 ? '#FAFAFA' : '#FFFFFF' }}>
            <td className="px-4 py-3">
              <input
                type="checkbox"
                checked={selectedIds.has(r.booking_id)}
                onChange={() => toggleId(r.booking_id)}
                className="rounded"
                style={{ accentColor: '#A85070' }}
              />
            </td>
            <Td mono>{r.booking_id}</Td>
            <Td>{r.name}</Td>
            <Td>{r.phone}</Td>
            <Td>{r.email}</Td>
            <Td>{r.date}</Td>
            <Td>{r.time}</Td>
            <Td>{Array.isArray(r.skin_concerns) && r.skin_concerns.length > 0 ? r.skin_concerns.join(', ') : null}</Td>
            <Td>{r.referral_source}</Td>
            <Td>
              <DeleteButton onClick={() => onDelete(r.booking_id)} />
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function CustomersTable({
  rows,
  selectedIds,
  toggleId,
  toggleAll,
  onDelete,
}: {
  rows: any[]
  selectedIds: Set<string>
  toggleId: (id: string) => void
  toggleAll: (ids: string[]) => void
  onDelete: (id: string) => void
}) {
  const ids = rows.map((r) => r.customer_id)
  const allSelected = ids.length > 0 && ids.every((id) => selectedIds.has(id))
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th className="px-4 py-3 w-10" style={{ backgroundColor: '#F9FAFB' }}>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => toggleAll(ids)}
              className="rounded"
              style={{ accentColor: '#A85070' }}
            />
          </th>
          <Th>Customer ID</Th>
          <Th>Name</Th>
          <Th>Email</Th>
          <Th>Phone</Th>
          <Th>Date of Birth</Th>
          <Th>Membership ID</Th>
          <Th></Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.customer_id ?? i} style={{ backgroundColor: i % 2 === 1 ? '#FAFAFA' : '#FFFFFF' }}>
            <td className="px-4 py-3">
              <input
                type="checkbox"
                checked={selectedIds.has(r.customer_id)}
                onChange={() => toggleId(r.customer_id)}
                className="rounded"
                style={{ accentColor: '#A85070' }}
              />
            </td>
            <Td mono>{r.customer_id}</Td>
            <Td>{r.name}</Td>
            <Td>{r.email}</Td>
            <Td>{r.phone}</Td>
            <Td>{r.dob}</Td>
            <Td mono>{r.membership_id}</Td>
            <Td>
              <DeleteButton onClick={() => onDelete(r.customer_id)} />
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border"
      style={{ borderColor: '#E8D5DA', color: '#C4768A', backgroundColor: '#FFFFFF' }}
    >
      Delete
    </button>
  )
}

function LoyaltyTable({
  rows,
  selectedIds,
  toggleId,
  toggleAll,
  onRevoke,
  onDelete,
}: {
  rows: any[]
  selectedIds: Set<string>
  toggleId: (id: string) => void
  toggleAll: (ids: string[]) => void
  onRevoke: (id: string) => void
  onDelete: (id: string) => void
}) {
  const ids = rows.map((r) => r.membership_id)
  const allSelected = ids.length > 0 && ids.every((id) => selectedIds.has(id))
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th className="px-4 py-3 w-10" style={{ backgroundColor: '#F9FAFB' }}>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => toggleAll(ids)}
              className="rounded"
              style={{ accentColor: '#A85070' }}
            />
          </th>
          <Th>Membership ID</Th>
          <Th>Name</Th>
          <Th>Email</Th>
          <Th>Phone</Th>
          <Th>Tier</Th>
          <Th>Discount</Th>
          <Th>Status</Th>
          <Th>Joined</Th>
          <Th>Expires</Th>
          <Th>Ziina Intent</Th>
          <Th></Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const tierBadge = TIER_BADGE[r.tier] ?? { bg: '#E5E7EB', color: '#6B7280', label: (r.tier ?? '—').toUpperCase() }
          const statusBadge = STATUS_BADGE(r.status)
          return (
            <tr key={r.membership_id ?? i} style={{ backgroundColor: i % 2 === 1 ? '#FAFAFA' : '#FFFFFF' }}>
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(r.membership_id)}
                  onChange={() => toggleId(r.membership_id)}
                  className="rounded"
                  style={{ accentColor: '#A85070' }}
                />
              </td>
              <Td mono>{r.membership_id}</Td>
              <Td>{r.name}</Td>
              <Td>{r.email}</Td>
              <Td>{r.phone}</Td>
              <Td>
                <Badge bg={tierBadge.bg} color={tierBadge.color}>
                  {tierBadge.label}
                </Badge>
              </Td>
              <Td>{r.discount_percent != null ? `${r.discount_percent}%` : null}</Td>
              <Td>
                <Badge bg={statusBadge.bg} color={statusBadge.color}>
                  {String(r.status ?? '').toUpperCase() || '—'}
                </Badge>
              </Td>
              <Td>{r.joined_at ? new Date(r.joined_at).toLocaleDateString() : null}</Td>
              <Td>{r.expires_at ? new Date(r.expires_at).toLocaleDateString() : null}</Td>
              <Td mono>{r.ziina_intent_id}</Td>
              <Td>
                <div className="flex items-center gap-2">
                  {(r.status ?? '').toLowerCase() === 'active' && (
                    <button
                      onClick={() => onRevoke(r.membership_id)}
                      className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border"
                      style={{ borderColor: '#E8D5DA', color: '#C4768A', backgroundColor: '#FFFFFF' }}
                    >
                      Revoke
                    </button>
                  )}
                  <DeleteButton onClick={() => onDelete(r.membership_id)} />
                </div>
              </Td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function CalendarView({ bookings }: { bookings: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week')

  const specialists = ['Muna Sherpa', 'Sadaf Shaazadi', 'Devi Gajnayake']

  const getWeekDays = (date: Date) => {
    const start = new Date(date)
    start.setDate(date.getDate() - date.getDay())
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }

  const weekDays = viewMode === 'week' ? getWeekDays(currentDate) : [currentDate]

  const goBack = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() - (viewMode === 'week' ? 7 : 1))
    setCurrentDate(d)
  }

  const goForward = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + (viewMode === 'week' ? 7 : 1))
    setCurrentDate(d)
  }

  const goToToday = () => setCurrentDate(new Date())

  const getBookingsForDayAndSpecialist = (day: Date, specialist: string) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    return bookings
      .filter((b) => b.date === dateStr && b.specialist === specialist && b.status !== 'cancelled')
      .sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''))
  }

  const specialistColors: Record<string, { bg: string; text: string; border: string }> = {
    'Muna Sherpa':    { bg: '#FDF0F3', text: '#A85070', border: '#F2C4D0' },
    'Sadaf Shaazadi': { bg: '#F0F4FF', text: '#4060C4', border: '#C4D0F2' },
    'Devi Gajnayake': { bg: '#F0FDF4', text: '#2D7A4F', border: '#C4E8D0' },
  }

  const isToday = (d: Date) =>
    format(d, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  const isMonday = (d: Date) => d.getDay() === 1

  return (
    <div>
      {/* Calendar header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-8 h-8 flex items-center justify-center rounded-full border"
            style={{ borderColor: '#E5E7EB' }}
          >
            ‹
          </button>
          <h2 className="text-lg font-bold" style={{ color: '#1A1A1A' }}>
            {viewMode === 'week'
              ? `${format(weekDays[0], 'MMM d')} – ${format(weekDays[6], 'MMM d, yyyy')}`
              : format(currentDate, 'EEEE, MMMM d, yyyy')}
          </h2>
          <button
            onClick={goForward}
            className="w-8 h-8 flex items-center justify-center rounded-full border"
            style={{ borderColor: '#E5E7EB' }}
          >
            ›
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-4 py-1.5 rounded-full text-xs font-bold border"
            style={{ borderColor: '#E5E7EB', color: '#1A1A1A' }}
          >
            Today
          </button>
          <button
            onClick={() => setViewMode('week')}
            className="px-4 py-1.5 rounded-full text-xs font-bold"
            style={{
              backgroundColor: viewMode === 'week' ? '#A85070' : '#FFFFFF',
              color: viewMode === 'week' ? '#FFFFFF' : '#1A1A1A',
              border: '1px solid #E5E7EB',
            }}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode('day')}
            className="px-4 py-1.5 rounded-full text-xs font-bold"
            style={{
              backgroundColor: viewMode === 'day' ? '#A85070' : '#FFFFFF',
              color: viewMode === 'day' ? '#FFFFFF' : '#1A1A1A',
              border: '1px solid #E5E7EB',
            }}
          >
            Day
          </button>
        </div>
      </div>

      {/* Specialist legend */}
      <div className="flex gap-4 mb-4 flex-wrap">
        {specialists.map((sp) => (
          <div key={sp} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: specialistColors[sp]?.border }}
            />
            <span className="text-xs" style={{ color: '#6B7280' }}>
              {sp}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        className="bg-white rounded-2xl border overflow-hidden"
        style={{ borderColor: '#E5E7EB' }}
      >
        {/* Day headers */}
        <div
          className="grid border-b"
          style={{
            gridTemplateColumns: `120px repeat(${weekDays.length}, 1fr)`,
            borderColor: '#E5E7EB',
          }}
        >
          <div className="p-3 border-r" style={{ borderColor: '#E5E7EB' }} />
          {weekDays.map((day) => (
            <div
              key={day.toISOString()}
              className="p-3 text-center border-r last:border-r-0"
              style={{
                borderColor: '#E5E7EB',
                backgroundColor: isToday(day)
                  ? '#FDF0F3'
                  : isMonday(day)
                  ? '#F9FAFB'
                  : '#FFFFFF',
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: '#9CA3AF' }}
              >
                {format(day, 'EEE')}
              </p>
              <p
                className="text-lg font-black mt-0.5"
                style={{
                  color: isToday(day)
                    ? '#A85070'
                    : isMonday(day)
                    ? '#D1D5DB'
                    : '#1A1A1A',
                }}
              >
                {format(day, 'd')}
              </p>
              {isMonday(day) && (
                <p className="text-xs" style={{ color: '#D1D5DB' }}>
                  Closed
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Specialist rows */}
        {specialists.map((specialist) => (
          <div
            key={specialist}
            className="grid border-b last:border-b-0"
            style={{
              gridTemplateColumns: `120px repeat(${weekDays.length}, 1fr)`,
              borderColor: '#E5E7EB',
              minHeight: '100px',
            }}
          >
            <div
              className="p-3 border-r flex items-start"
              style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFAFA' }}
            >
              <div>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white mb-1"
                  style={{
                    backgroundColor: specialistColors[specialist]?.border ?? '#C4768A',
                  }}
                >
                  {specialist.split(' ').map((s) => s[0]).join('')}
                </div>
                <p
                  className="text-xs font-semibold leading-tight"
                  style={{ color: '#1A1A1A' }}
                >
                  {specialist.split(' ')[0]}
                </p>
                <p className="text-xs leading-tight" style={{ color: '#9CA3AF' }}>
                  {specialist.split(' ')[1]}
                </p>
              </div>
            </div>

            {weekDays.map((day) => {
              const dayBookings = getBookingsForDayAndSpecialist(day, specialist)
              const colors = specialistColors[specialist]
              return (
                <div
                  key={day.toISOString()}
                  className="p-2 border-r last:border-r-0"
                  style={{
                    borderColor: '#E5E7EB',
                    backgroundColor: isMonday(day) ? '#F9FAFB' : '#FFFFFF',
                    minHeight: '100px',
                  }}
                >
                  {isMonday(day) ? (
                    <p
                      className="text-xs text-center mt-4"
                      style={{ color: '#D1D5DB' }}
                    >
                      —
                    </p>
                  ) : dayBookings.length === 0 ? null : (
                    <div className="space-y-1">
                      {dayBookings.map((b) => (
                        <div
                          key={b.booking_id}
                          className="rounded-lg p-1.5 text-xs"
                          style={{
                            backgroundColor: colors?.bg,
                            border: `1px solid ${colors?.border}`,
                            color: colors?.text,
                          }}
                        >
                          <p className="font-bold leading-tight">{b.time}</p>
                          <p className="leading-tight truncate">{b.service}</p>
                          <p className="leading-tight truncate opacity-75">
                            {b.customer_name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {bookings.filter((b) => b.status !== 'cancelled').length === 0 && (
        <p className="text-center py-12 text-sm" style={{ color: '#9CA3AF' }}>
          No bookings to display.
        </p>
      )}
    </div>
  )
}
