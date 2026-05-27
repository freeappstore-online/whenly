import { type ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { User } from '@freeappstore/sdk'
import { fas } from '../lib/fas'

const NAV = [
  { label: 'Home', path: '/' },
  { label: 'Create', path: '/new' },
  { label: 'My Polls', path: '/my-polls' },
]

export function Shell({ children, user }: { children: ReactNode; user: User | null }) {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex min-h-[100dvh] flex-col">
      {/* Top bar */}
      <header className="border-b border-[var(--line)] bg-gray-900 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-violet-400">
              <svg viewBox="0 0 16 12" className="h-3.5 w-3.5 text-violet-400" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1.5 6.5L5.5 10.5L14.5 1.5" />
              </svg>
            </div>
            <div className="leading-none">
              <span className="text-sm font-bold text-white">whenly</span>
              <span className="ml-0.5 text-[0.6rem] text-gray-400">.online</span>
            </div>
          </Link>

          {/* Desktop nav + auth */}
          <div className="hidden items-center gap-3 md:flex">
            <nav className="flex gap-1">
              {NAV.map(n => (
                <Link
                  key={n.path}
                  to={n.path}
                  className={`rounded-lg px-3 py-1.5 text-sm transition ${pathname === n.path ? 'bg-violet-600 text-white' : 'text-gray-300 hover:bg-white/10'}`}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
            {user ? (
              <div className="flex items-center gap-2">
                {user.avatarUrl && <img src={user.avatarUrl} className="h-6 w-6 rounded-full" alt="" />}
                <span className="text-xs text-gray-400">{user.login}</span>
                <button onClick={() => fas.auth.signOut()} className="text-xs text-gray-500 hover:text-white">Sign out</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => fas.auth.signIn('github')} className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-violet-700">
                  Sign in with GitHub
                </button>
                <button onClick={() => fas.auth.signIn('google')} className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-violet-700">
                  Sign in with Google
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="border-t border-white/10 px-4 pb-3 md:hidden">
            {NAV.map(n => (
              <Link
                key={n.path}
                to={n.path}
                onClick={() => setMenuOpen(false)}
                className={`block rounded-lg px-3 py-2 text-sm transition ${pathname === n.path ? 'bg-violet-600 text-white' : 'text-gray-300 hover:bg-white/10'}`}
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-white/10 pt-2">
              {user ? (
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm text-gray-400">{user.login}</span>
                  <button onClick={() => { fas.auth.signOut(); setMenuOpen(false) }} className="text-xs text-gray-500">Sign out</button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <button onClick={() => { fas.auth.signIn('github'); setMenuOpen(false) }} className="block w-full rounded-lg bg-violet-600 px-3 py-2 text-center text-sm font-semibold text-white">
                    Sign in with GitHub
                  </button>
                  <button onClick={() => { fas.auth.signIn('google'); setMenuOpen(false) }} className="block w-full rounded-lg bg-violet-600 px-3 py-2 text-center text-sm font-semibold text-white">
                    Sign in with Google
                  </button>
                </div>
              )}
            </div>
          </nav>
        )}
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--line)] bg-[var(--paper-deep)] py-4 text-center text-xs text-[var(--muted)]">
        <Link to="/" className="inline-flex items-center gap-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-full border border-violet-400">
            <svg viewBox="0 0 16 12" className="h-2.5 w-2.5 text-violet-400" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1.5 6.5L5.5 10.5L14.5 1.5" />
            </svg>
          </div>
          <span className="font-semibold text-[var(--ink)]">whenly</span>
        </Link>
        <p className="mt-1">Part of <a href="https://freeappstore.online" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--ink)]">FreeAppStore</a></p>
      </footer>
    </div>
  )
}
