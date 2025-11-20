'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { User, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [dropdownRef])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-funky-dark hover:bg-funky-yellow hover:text-black transition-colors text-funky-yellow border border-funky-yellow"
      >
        <User size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-funky-black border border-funky-dark rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="py-1">
            <Link 
                href="/account" 
                className="flex items-center gap-2 px-4 py-3 text-sm text-funky-text hover:bg-funky-dark transition-colors"
                onClick={() => setIsOpen(false)}
            >
                <Settings size={16} /> Account Settings
            </Link>
            <button 
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-funky-dark transition-colors text-left"
            >
                <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
