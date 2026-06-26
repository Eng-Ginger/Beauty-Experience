'use client'
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

export type Customer = {
  customerId: string
  name: string
  email: string
  phone: string | null
  dob: string | null
  membershipId: string | null
  membership?: {
    tier: string
    status: string
    discountPercent: number
    expiresAt: string
    membershipId: string
  } | null
}

const CustomerContext = createContext<{
  customer: Customer | null
  loading: boolean
  refetch: () => Promise<void>
}>({ customer: null, loading: true, refetch: async () => {} })

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setCustomer(data)
      } else {
        setCustomer(null)
      }
    } catch {
      setCustomer(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return (
    <CustomerContext.Provider value={{ customer, loading, refetch }}>
      {children}
    </CustomerContext.Provider>
  )
}

export const useCustomer = () => useContext(CustomerContext)
