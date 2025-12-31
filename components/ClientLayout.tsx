'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Hide navbar/footer on dashboard, personal-dashboard, upgrade-skill, and recommended-courses pages
  const hideNavbar = pathname === '/dashboard' ||
                     pathname === '/personal-dashboard' ||
                     pathname === '/upgrade-skill' ||
                     pathname === '/recommended-courses'

  if (hideNavbar) {
    return <>{children}</>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  )
}
