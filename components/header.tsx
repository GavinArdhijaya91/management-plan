'use client'

import { ConfirmationDialog } from '@/app/manajemen/_components/confirmation-dialog'
import { LanguageSelector } from '@/app/_components/language-selector'
import { useLanguage } from '@/app/_i18n/language-provider'
import { logout as logoutAction } from '@/app/auth/actions'
import { appRoutes } from '@/data/navigation'
import { cn } from '@/lib/utils'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import { UserCircleIcon as UserCircleSolidIcon } from '@heroicons/react/24/solid'
import { Bell, ChevronDown, LogOut, Menu, User, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

function isCurrentRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

interface HeaderProps {
  mode?: 'private' | 'demo'
}

export function Header({ mode = 'private' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const pathname = usePathname()
  const { dictionary } = useLanguage()
  const demoMode = mode === 'demo'
  const routeHref = (href: string) => (demoMode ? `/demo${href}` : href)
  const primaryRoutes = appRoutes.filter(
    (item) => item.href !== '/hubungi-kami' && (!demoMode || item.href !== '/kolaborasi'),
  )
  const supportRoute = appRoutes.find((item) => item.href === '/hubungi-kami')
  const activeRoute = appRoutes.find((item) => isCurrentRoute(pathname, routeHref(item.href)))
  const supportCurrent = supportRoute ? isCurrentRoute(pathname, routeHref(supportRoute.href)) : false
  const SupportIcon = supportRoute ? (supportCurrent ? supportRoute.activeIcon : supportRoute.icon) : null
  const profileCurrent = isCurrentRoute(pathname, routeHref('/profil'))

  const closeMenus = () => {
    setMobileMenuOpen(false)
    setNotificationOpen(false)
    setProfileOpen(false)
  }

  const requestLogout = () => {
    closeMenus()
    setLogoutOpen(true)
  }

  const navigation = (
    <>
      <nav aria-label={dictionary.header.mainNavigation} className="space-y-1">
        {primaryRoutes.map((item) => {
          const href = routeHref(item.href)
          const current = isCurrentRoute(pathname, href)
          const Icon = current ? item.activeIcon : item.icon

          return (
            <Link
              key={item.href}
              href={href}
              aria-current={current ? 'page' : undefined}
              onClick={closeMenus}
              className={cn(
                'group relative flex min-h-10 items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                current ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950',
              )}
            >
              <Icon
                className={cn('size-[1.15rem] shrink-0', current ? 'text-zinc-950' : 'text-zinc-400')}
                aria-hidden="true"
              />
              <span>{dictionary.nav[item.translationKey] ?? item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-zinc-200 pt-4">
        {supportRoute && SupportIcon && (
          <Link
            href={routeHref(supportRoute.href)}
            aria-current={supportCurrent ? 'page' : undefined}
            onClick={closeMenus}
            className={cn(
              'flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              supportCurrent ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950',
            )}
          >
            <SupportIcon className="size-5" aria-hidden="true" />
            <span>{dictionary.nav[supportRoute.translationKey] ?? supportRoute.label}</span>
          </Link>
        )}
        <Link
          href={routeHref('/profil')}
          aria-current={profileCurrent ? 'page' : undefined}
          onClick={closeMenus}
          className={cn(
            'mt-1 flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
            profileCurrent ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950',
          )}
        >
          {profileCurrent ? (
            <UserCircleSolidIcon className="size-5" aria-hidden="true" />
          ) : (
            <UserCircleIcon className="size-5" aria-hidden="true" />
          )}
          <span>{dictionary.nav.profile}</span>
        </Link>
        <button
          type="button"
          onClick={requestLogout}
          className="mt-1 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
        >
          <LogOut className="size-5" aria-hidden="true" />
          <span>{demoMode ? 'Keluar dari demo' : dictionary.header.logout}</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-zinc-200 bg-white p-3 lg:flex lg:flex-col">
        <Link href={routeHref('/dashboard')} className="flex min-h-14 items-center gap-3 px-2">
          <span className="motion-logo flex size-8 items-center justify-center rounded-lg bg-zinc-950 font-serif text-sm font-semibold text-white">
            S
          </span>
          <span>
            <strong className="block font-serif text-lg leading-tight">Siapin</strong>
            <span className="text-xs text-zinc-500">Business management plan</span>
          </span>
        </Link>

        <Link
          href={demoMode ? '/auth/sign-up' : '/workspace/select'}
          className="my-4 flex min-h-13 items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2 transition-colors hover:bg-zinc-50"
        >
          <span className="min-w-0">
            <span className="app-label block">{demoMode ? 'Mode demo' : 'Ruang kerja'}</span>
            <strong className="mt-0.5 block truncate text-sm">
              {demoMode ? 'Buat akun untuk menyimpan data' : 'Pilih atau ganti workspace'}
            </strong>
          </span>
          <ChevronDown className="size-4 shrink-0 text-zinc-500" aria-hidden="true" />
        </Link>

        {navigation}
      </aside>

      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label={dictionary.header.openMenu}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              className="flex size-11 items-center justify-center rounded-xl hover:bg-zinc-100 lg:hidden"
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>
            <div className="min-w-0">
              <p className="app-label hidden sm:block">{demoMode ? 'Demo · data lokal' : 'Workspace'}</p>
              <p className="truncate font-serif text-base font-semibold">
                {activeRoute ? (dictionary.nav[activeRoute.translationKey] ?? activeRoute.label) : 'Siapin'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageSelector />
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationOpen((open) => !open)
                  setProfileOpen(false)
                }}
                aria-label={dictionary.header.openNotifications}
                aria-expanded={notificationOpen}
                className="relative flex size-11 items-center justify-center rounded-xl hover:bg-zinc-100"
              >
                <Bell className="size-5 text-zinc-600" />
                {demoMode && (
                  <span className="absolute right-2.5 top-2.5 size-2 rounded-full border-2 border-white bg-zinc-950" />
                )}
              </button>
              {notificationOpen && (
                <div className="motion-window-origin absolute right-0 top-12 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-zinc-200 bg-white p-3 shadow-xl">
                  <p className="px-2 py-1 font-serif text-lg font-semibold">{dictionary.header.notifications}</p>
                  {demoMode && (
                    <Link
                      href={routeHref('/notifikasi')}
                      onClick={closeMenus}
                      className="mt-2 block rounded-xl bg-zinc-100 p-3 text-sm"
                    >
                      <strong>{dictionary.header.stockAlert}</strong>
                      <span className="mt-1 block text-xs text-zinc-500">{dictionary.header.stockDetail}</span>
                    </Link>
                  )}
                  <Link
                    href={routeHref('/notifikasi')}
                    onClick={closeMenus}
                    className="mt-1 block rounded-xl p-3 text-sm hover:bg-zinc-50"
                  >
                    {dictionary.header.viewAll}
                  </Link>
                </div>
              )}
            </div>

            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((open) => !open)
                  setNotificationOpen(false)
                }}
                aria-label={dictionary.header.openProfile}
                aria-expanded={profileOpen}
                className="flex size-11 items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200"
              >
                <User className="size-5 text-zinc-700" />
              </button>
              {profileOpen && (
                <div className="motion-window-origin absolute right-0 top-12 w-56 rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl">
                  <div className="border-b border-zinc-100 px-3 py-2">
                    <p className="text-sm font-semibold">Akun Siapin</p>
                    <p className="text-xs text-zinc-500">{dictionary.header.businessOwner}</p>
                  </div>
                  <Link
                    href={routeHref('/profil')}
                    onClick={closeMenus}
                    className="mt-1 block rounded-lg px-3 py-2 text-sm hover:bg-zinc-100"
                  >
                    {dictionary.header.profileSettings}
                  </Link>
                  <button
                    type="button"
                    onClick={requestLogout}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-100"
                  >
                    {dictionary.header.logout}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label={dictionary.header.closeMenu}
            onClick={closeMenus}
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[2px]"
          />
          <aside
            id="mobile-navigation"
            className="motion-window-origin-left absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col bg-white p-4 shadow-2xl"
          >
            <div className="mb-5 flex min-h-14 items-center justify-between">
              <Link href={routeHref('/dashboard')} onClick={closeMenus} className="flex items-center gap-3 px-2">
                <span className="flex size-9 items-center justify-center rounded-xl bg-zinc-950 font-serif text-lg font-semibold text-white">
                  S
                </span>
                <strong className="font-serif text-lg">Siapin</strong>
              </Link>
              <button
                type="button"
                onClick={closeMenus}
                aria-label={dictionary.header.closeMenu}
                className="flex size-11 items-center justify-center rounded-xl hover:bg-zinc-100"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            {navigation}
          </aside>
        </div>
      )}

      <ConfirmationDialog
        open={logoutOpen}
        title={demoMode ? 'Keluar dari mode demo?' : dictionary.header.logoutTitle}
        description={
          demoMode
            ? 'Anda akan kembali ke halaman utama. Data demo tetap tersimpan di perangkat ini.'
            : dictionary.header.logoutDescription
        }
        confirmLabel={demoMode ? 'Keluar dari demo' : dictionary.header.logout}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={() => (demoMode ? window.location.assign('/') : logoutAction())}
      />
    </>
  )
}
