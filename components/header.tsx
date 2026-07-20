'use client'

import Link from 'next/link'
import { Menu, Bell, User, LogOut } from 'lucide-react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { appRoutes } from '@/data/navigation'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="hidden md:inline font-bold text-gray-900">Siapin</span>
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Navigasi utama" className="hidden md:flex items-center gap-1">
            {appRoutes.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? 'page' : undefined}
                className={cn(
                  'rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-blue-600',
                  pathname === item.href && 'bg-blue-50 font-medium text-blue-700',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2 md:gap-4">
            <button aria-label="Buka notifikasi" className="min-h-11 min-w-11 p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <button aria-label="Buka profil" className="min-h-11 min-w-11 p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <User className="w-5 h-5 text-gray-600" />
            </button>
            <button aria-label="Keluar" className="hidden min-h-11 min-w-11 p-2 hover:bg-gray-100 rounded-lg transition-colors md:flex md:items-center md:justify-center">
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav id="mobile-navigation" aria-label="Navigasi seluler" className="md:hidden pb-4 flex flex-col gap-1">
            {appRoutes.map((item) => {
              const Icon = item.icon

              return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? 'page' : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-blue-600',
                  pathname === item.href && 'bg-blue-50 font-medium text-blue-700',
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {item.label}
              </Link>
              )
            })}
            <button className="min-h-11 px-3 py-2.5 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors text-left">
              Logout
            </button>
          </nav>
        )}
      </div>
    </header>
  )
}
