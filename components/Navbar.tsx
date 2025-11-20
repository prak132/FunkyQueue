'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlusSquare, Settings, User as UserIcon } from 'lucide-react'
import { clsx } from 'clsx'
import UserDropdown from './UserDropdown'

export default function Navbar() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Queue', icon: Home },
    { href: '/machinist', label: 'My Jobs', icon: Settings },
    { href: '/queue/cam/add', label: 'Add CAM', icon: PlusSquare },
    { href: '/queue/machining/add', label: 'Add Machining', icon: PlusSquare },
  ]

  // Mobile Bottom Nav
  const MobileNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 bg-funky-black border-t border-funky-dark p-4 md:hidden z-50">
      <ul className="flex justify-around items-center">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <li key={link.href}>
              <Link href={link.href} className={clsx(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                isActive ? "text-funky-yellow" : "text-funky-text-dim hover:text-funky-text"
              )}>
                <Icon size={24} />
                <span className="text-[10px] font-medium">{link.label}</span>
              </Link>
            </li>
          )
        })}
        {/* Profile Link for Mobile */}
        <li>
            <Link href="/account" className={clsx(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                pathname === '/account' ? "text-funky-yellow" : "text-funky-text-dim hover:text-funky-text"
            )}>
                <UserIcon size={24} />
                <span className="text-[10px] font-medium">Profile</span>
            </Link>
        </li>
      </ul>
    </nav>
  )

  // Desktop Top Nav
  const DesktopNav = () => (
    <nav className="hidden md:flex fixed top-0 left-0 right-0 bg-funky-black/80 backdrop-blur-md border-b border-funky-dark px-8 py-4 z-50 justify-between items-center">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-xl font-bold text-funky-yellow tracking-tight">
            FUNKY<span className="text-white">QUEUE</span>
        </Link>
        <ul className="flex gap-6">
            {links.map((link) => {
                const isActive = pathname === link.href
                return (
                    <li key={link.href}>
                        <Link href={link.href} className={clsx(
                            "text-sm font-medium transition-colors hover:text-funky-yellow",
                            isActive ? "text-funky-yellow" : "text-funky-text-dim"
                        )}>
                            {link.label}
                        </Link>
                    </li>
                )
            })}
            {/* Admin Link - Only show on desktop here, or maybe check role? For now just link */}
            <li>
                <Link href="/admin" className={clsx(
                    "text-sm font-medium transition-colors hover:text-funky-yellow",
                    pathname === '/admin' ? "text-funky-yellow" : "text-funky-text-dim"
                )}>
                    Admin
                </Link>
            </li>
        </ul>
      </div>

      <div className="flex items-center gap-4">
        <UserDropdown />
      </div>
    </nav>
  )

  return (
    <>
      <MobileNav />
      <DesktopNav />
    </>
  )
}
