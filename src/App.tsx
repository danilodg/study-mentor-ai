import { useEffect } from 'react'
import { MoonStar, SunMedium } from 'lucide-react'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useChatApp } from './hooks/useChatApp'
import { AppProvider } from './context/AppContext'
import { AppNewConversationModal } from './features/chat/components/AppNewConversationModal'
import { LandingPage } from './features/landing/page/LandingPage'
import { AuthPage } from './features/auth/page/AuthPage'
import { ProfilePage } from './features/profile/page/ProfilePage'
import { ChatPage } from './features/chat/page/ChatPage'

function AppRoutes() {
  const navigate = useNavigate()
  const location = useLocation()
  const app = useChatApp()

  useEffect(() => {
    if (app.session && location.pathname === '/auth') {
      navigate('/chat', { replace: true })
    }
  }, [app.session, location.pathname, navigate])

  useEffect(() => {
    if (location.pathname !== '/chat') {
      app.setIsMobileConversationMenuOpen(false)
      app.setIsDesktopSidebarPinned(false)
      app.setIsDesktopSidebarHovered(false)
    }
  }, [
    location.pathname,
    app.setIsDesktopSidebarHovered,
    app.setIsDesktopSidebarPinned,
    app.setIsMobileConversationMenuOpen,
  ])

  const conversationSummaries = app.conversationList.map((conversation) => ({
    id: conversation.id,
    title: conversation.title,
  }))
  const isLandingPage = location.pathname === '/'

  return (
    <AppProvider value={{ app, conversationSummaries }}>
      <div
        className={[
          'min-h-screen overflow-hidden bg-[var(--page-bg)] text-[color:var(--text-soft)] [font-family:Outfit,Segoe_UI,sans-serif] transition-colors duration-300',
          app.theme === 'dark' ? 'app-theme-dark' : 'app-theme-light',
        ].join(' ')}
      >
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_14%,var(--page-radial),transparent_36%),var(--page-gradient)]" />
      <div className="pointer-events-none fixed inset-0 grid-mask opacity-35" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_16%,var(--glow-left),transparent_26%)] blur-3xl" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_84%_18%,var(--glow-right),transparent_23%)] blur-3xl" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_26%_84%,var(--glow-bottom-left),transparent_25%)] blur-3xl" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_76%_86%,var(--glow-bottom-right),transparent_24%)] blur-3xl" />

      {isLandingPage ? (
        <div className="pointer-events-none fixed bottom-8 left-6 z-30 hidden lg:block">
          <button
            type="button"
            onClick={() => app.setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
            className="pointer-events-auto group flex h-14 w-14 items-center overflow-hidden rounded-[10px] border border-[color:var(--panel-border)] accent-button text-white transition-[width,transform] duration-300 ease-out hover:w-36 hover:-translate-y-0.5"
            aria-label={app.t.theme}
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center">
              {app.theme === 'dark' ? <SunMedium size={18} /> : <MoonStar size={18} />}
            </span>
            <span className="min-w-max whitespace-nowrap pr-5 text-sm font-medium uppercase tracking-[0.08em] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {app.t.theme}
            </span>
          </button>
        </div>
      ) : null}

      {isLandingPage ? (
        <div className="fixed bottom-8 right-6 z-30 hidden lg:block">
          <div className="glass-panel inline-flex h-14 items-center gap-2 rounded-[10px] px-3 text-[color:var(--text-main)]">
            <span className="pl-1 font-['IBM_Plex_Mono'] text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
              {app.t.language}
            </span>
            <div className="relative grid grid-cols-2 items-center rounded-[10px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] p-1">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.125rem)] rounded-[10px] bg-[linear-gradient(135deg,var(--accent-start),var(--accent-mid)_55%,var(--accent-end))] shadow-[0_0_18px_var(--accent-shadow)] transition-transform duration-300 ease-out"
                style={{ transform: `translateX(${app.language === 'pt' ? '0%' : '100%'})` }}
              />
              {(['pt', 'en'] as const).map((option) => {
                const active = app.language === option

                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={active}
                    onClick={() => app.switchLanguage(option)}
                    className={[
                      'relative z-10 inline-flex h-8 min-w-11 items-center justify-center rounded-[10px] px-3 font-[IBM_Plex_Mono] text-[0.68rem] font-semibold uppercase tracking-[0.16em] transition',
                      active ? 'text-white' : 'text-[color:var(--text-soft)] hover:text-[color:var(--text-main)]',
                    ].join(' ')}
                  >
                    {option.toUpperCase()}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}

      <main className={[
        'relative z-10 mx-auto p-0',
        location.pathname === '/' ? 'max-w-[1180px]' : 'max-w-[1880px]',
      ].join(' ')}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <AppNewConversationModal />
      </div>
    </AppProvider>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
