'use client'

import Link from 'next/link'
import { Menu, Bell, User, LogOut } from 'lucide-react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { appRoutes } from '@/data/navigation'
import { ConfirmationDialog } from '@/app/manajemen/_components/confirmation-dialog'
import { LanguageSelector } from '@/app/_components/language-selector'
import { useLanguage } from '@/app/_i18n/language-provider'

interface HeaderProps {
  variant?: 'default' | 'monochrome'
}

export function Header({ variant = 'default' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { dictionary } = useLanguage()

  const logout = () => { setNotificationOpen(false); setProfileOpen(false); setLogoutOpen(true) }

  return (
    <><header className={cn(
      'sticky top-0 z-40 border-b bg-white',
      variant === 'monochrome' ? 'border-zinc-200/80' : 'border-gray-200 shadow-sm',
    )}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', variant === 'monochrome' ? 'bg-zinc-950' : 'bg-blue-600')}>
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className={cn('hidden text-gray-900 md:inline', variant === 'monochrome' ? 'font-serif text-lg font-semibold' : 'font-bold')}>Siapin</span>
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label={dictionary.header.mainNavigation} className="hidden md:flex items-center gap-1">
            {appRoutes.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? 'page' : undefined}
                className={cn(
                  'rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100',
                  variant === 'monochrome' ? 'hover:text-zinc-950' : 'hover:text-blue-600',
                  pathname === item.href && (variant === 'monochrome' ? 'bg-zinc-100 font-medium text-zinc-950' : 'bg-blue-50 font-medium text-blue-700'),
                )}
              >
                {dictionary.nav[item.translationKey]}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2 md:gap-4">
            <LanguageSelector />
            <div className="relative">
              <button onClick={() => { setNotificationOpen(!notificationOpen); setProfileOpen(false) }} aria-label={dictionary.header.openNotifications} aria-expanded={notificationOpen} className="relative min-h-11 min-w-11 rounded-lg p-2 transition-colors hover:bg-gray-100">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-zinc-950" />
              </button>
              {notificationOpen && <div className="absolute right-0 top-12 w-80 rounded-2xl border border-zinc-200 bg-white p-3 shadow-xl"><p className="px-2 py-1 font-serif text-lg font-semibold">{dictionary.header.notifications}</p><Link href="/notifikasi" onClick={() => setNotificationOpen(false)} className="mt-2 block rounded-xl bg-zinc-100 p-3 text-sm"><strong>{dictionary.header.stockAlert}</strong><span className="mt-1 block text-xs text-zinc-500">{dictionary.header.stockDetail}</span></Link><Link href="/notifikasi" onClick={() => setNotificationOpen(false)} className="mt-1 block rounded-xl p-3 text-sm hover:bg-zinc-50">{dictionary.header.viewAll}</Link></div>}
            </div>
            <div className="relative">
              <button onClick={() => { setProfileOpen(!profileOpen); setNotificationOpen(false) }} aria-label={dictionary.header.openProfile} aria-expanded={profileOpen} className="min-h-11 min-w-11 rounded-lg p-2 transition-colors hover:bg-gray-100">
                <User className="w-5 h-5 text-gray-600" />
              </button>
              {profileOpen && <div className="absolute right-0 top-12 w-56 rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl"><div className="border-b border-zinc-100 px-3 py-2"><p className="text-sm font-semibold">Bu Rina</p><p className="text-xs text-zinc-500">{dictionary.header.businessOwner}</p></div><Link href="/profil" onClick={() => setProfileOpen(false)} className="mt-1 block rounded-lg px-3 py-2 text-sm hover:bg-zinc-100">{dictionary.header.profileSettings}</Link><button onClick={logout} className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-100">{dictionary.header.logout}</button></div>}
            </div>
            <button onClick={logout} aria-label={dictionary.header.logout} className="hidden min-h-11 min-w-11 p-2 hover:bg-gray-100 rounded-lg transition-colors md:flex md:items-center md:justify-center">
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? dictionary.header.closeMenu : dictionary.header.openMenu}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav id="mobile-navigation" aria-label={dictionary.header.mobileNavigation} className="md:hidden pb-4 flex flex-col gap-1">
            {appRoutes.map((item) => {
              const Icon = item.icon

              return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? 'page' : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-gray-600 transition-colors hover:bg-gray-100',
                  variant === 'monochrome' ? 'hover:text-zinc-950' : 'hover:text-blue-600',
                  pathname === item.href && (variant === 'monochrome' ? 'bg-zinc-100 font-medium text-zinc-950' : 'bg-blue-50 font-medium text-blue-700'),
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {dictionary.nav[item.translationKey]}
              </Link>
              )
            })}
            <Link href="/profil" onClick={() => setMobileMenuOpen(false)} className="min-h-11 rounded-lg px-3 py-2.5 text-left text-gray-600 transition-colors hover:bg-gray-100 hover:text-zinc-950">
              {dictionary.nav.profile}
            </Link>
            <button onClick={logout} className="min-h-11 rounded-lg px-3 py-2.5 text-left text-gray-600 transition-colors hover:bg-gray-100 hover:text-zinc-950">
              {dictionary.header.logout}
            </button>
          </nav>
        )}
      </div>
    </header><ConfirmationDialog open={logoutOpen} title={dictionary.header.logoutTitle} description={dictionary.header.logoutDescription} confirmLabel={dictionary.header.logout} onCancel={() => setLogoutOpen(false)} onConfirm={() => router.push('/')} /></>
  )
}
