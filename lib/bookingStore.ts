import { create } from 'zustand'

export type LoyaltyTier = 'rose' | 'gold' | 'platinum'

export type SelectedItem = { name: string; price: number } | null

interface BookingStore {
  bookingOpen: boolean
  authOpen: boolean
  loyaltyOpen: boolean
  mirrorOpen: boolean
  pendingBooking: boolean
  pendingLoyalty: boolean
  selectedTier: LoyaltyTier | null
  preSelectedService: string | null
  selectedItem: SelectedItem
  openBooking: () => void
  openBookingWithService: (serviceKey: string) => void
  closeBooking: () => void
  openAuth: () => void
  closeAuth: () => void
  openLoyalty: (tier?: LoyaltyTier) => void
  closeLoyalty: () => void
  openMirror: () => void
  closeMirror: () => void
  setPendingBooking: (v: boolean) => void
  setPendingLoyalty: (v: boolean) => void
  setSelectedItem: (item: SelectedItem) => void
}

export const useBookingStore = create<BookingStore>((set) => ({
  bookingOpen: false,
  authOpen: false,
  loyaltyOpen: false,
  mirrorOpen: false,
  pendingBooking: false,
  pendingLoyalty: false,
  selectedTier: null,
  preSelectedService: null,
  selectedItem: null,
  openBooking: () => set({ bookingOpen: true, preSelectedService: null, selectedItem: null }),
  openBookingWithService: (serviceKey) =>
    set({ bookingOpen: true, preSelectedService: serviceKey, selectedItem: null }),
  closeBooking: () =>
    set({ bookingOpen: false, preSelectedService: null, selectedItem: null }),
  openAuth: () => set({ authOpen: true }),
  closeAuth: () => set({ authOpen: false }),
  openLoyalty: (tier) => set({ loyaltyOpen: true, selectedTier: tier ?? null }),
  closeLoyalty: () => set({ loyaltyOpen: false, selectedTier: null }),
  openMirror: () => set({ mirrorOpen: true }),
  closeMirror: () => set({ mirrorOpen: false }),
  setPendingBooking: (v) => set({ pendingBooking: v }),
  setPendingLoyalty: (v) => set({ pendingLoyalty: v }),
  setSelectedItem: (item) => set({ selectedItem: item }),
}))
