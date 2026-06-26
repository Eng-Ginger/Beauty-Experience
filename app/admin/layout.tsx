import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
  title: 'Admin · Beauty Experience',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
