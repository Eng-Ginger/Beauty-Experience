'use client'
import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useBookingStore } from '@/lib/bookingStore'
import HeroSection from '@/components/sections/HeroSection'
import TechShowcase from '@/components/sections/TechShowcase'
import ServicesSection from '@/components/sections/ServicesSection'
import NailPrinterShowcase from '@/components/sections/NailPrinterShowcase'
import SmartMirrorSpot from '@/components/sections/SmartMirrorSpot'
import Testimonials from '@/components/sections/Testimonials'
import LoyaltySection from '@/components/sections/LoyaltySection'
import AboutSection from '@/components/sections/AboutSection'
import Footer from '@/components/layout/Footer'
import BookingModal from '@/components/ui/BookingModal'
import SmartMirrorModal from '@/components/ui/SmartMirrorModal'
import LoyaltyModal from '@/components/ui/LoyaltyModal'
import AuthModal from '@/components/ui/AuthModal'
import PaymentStatusBanner from '@/components/ui/PaymentStatusBanner'

function QueryHandler() {
  const params = useSearchParams()
  const { openAuth } = useBookingStore()
  useEffect(() => {
    if (params.get('signin') === 'true') openAuth()
  }, [params, openAuth])
  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [])
  return null
}

export default function Page() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Suspense fallback={null}>
        <QueryHandler />
      </Suspense>
      <Suspense fallback={null}>
        <PaymentStatusBanner />
      </Suspense>
      <HeroSection />
      <TechShowcase />
      <ServicesSection />
      <NailPrinterShowcase />
      <SmartMirrorSpot />
      <Testimonials />
      <LoyaltySection />
      <AboutSection />
      <Footer />
      <BookingModal />
      <SmartMirrorModal />
      <LoyaltyModal />
      <AuthModal />
    </main>
  )
}
