import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { CustomerProvider } from '@/lib/useCustomer'
import Navbar from '@/components/layout/Navbar'
import PageLoader from '@/components/ui/PageLoader'
import SmoothScroll from '@/components/ui/SmoothScroll'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Beauty Experience — Ladies Salon Sharjah',
  description:
    'Luxury ladies salon in Sharjah with AI Smart Mirror and 3D nail artistry.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-poppins text-charcoal overflow-x-hidden">
        <CustomerProvider>
          <PageLoader />
          <SmoothScroll>
            <Navbar />
            {children}
          </SmoothScroll>
        </CustomerProvider>
      </body>
    </html>
  )
}
