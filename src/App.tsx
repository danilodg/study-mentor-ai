import { useEffect } from 'react'
import { MoonStar, SunMedium } from 'lucide-react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import {
  conversationModeLabel,
  difficultyLabel,
  examFlowLabel,
  examProfileLabel,
  responseModeLabel,
  responseModeOptions,
} from './content/copy'
import type { Screen } from './types/chat'
import { markdownComponents, markdownInlineComponents } from './utils/markdown'
import { useChatApp } from './hooks/useChatApp'
import { NewConversationModal } from './components/NewConversationModal'
import { LandingPage } from './pages/LandingPage'
import { AuthPage } from './pages/AuthPage'
import { ProfilePage } from './pages/ProfilePage'
import { ChatPage } from './pages/ChatPage'

function App() {
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

  function setScreen(screen: Screen) {
    const nextPath = screen === 'landing'
      ? '/'
      : `/${screen}`
    navigate(nextPath)
  }

  function goToChatWithAuthGate() {
    if (app.isSupabaseConfigured && !app.session) {
      navigate('/auth')
      return
    }

    navigate('/chat')
  }

  const conversationSummaries = app.conversationList.map((conversation) => ({
    id: conversation.id,
    title: conversation.title,
  }))

  return (
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

      <div className="pointer-events-none fixed bottom-8 left-6 z-30 hidden lg:block">
        <button
          type="button"
          onClick={() => app.setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
          className="pointer-events-auto group flex h-14 w-14 items-center overflow-hidden rounded-[20px] border border-[color:var(--panel-border)] accent-button text-white transition-[width,transform] duration-300 ease-out hover:w-36 hover:-translate-y-0.5"
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

      <div className="fixed bottom-8 right-6 z-30 hidden lg:block">
        <div className="glass-panel inline-flex h-14 items-center gap-2 rounded-[20px] px-3 text-[color:var(--text-main)]">
          <span className="pl-1 font-['IBM_Plex_Mono'] text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
            {app.t.language}
          </span>
          <div className="relative grid grid-cols-2 items-center rounded-[16px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] p-1">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.125rem)] rounded-[12px] bg-[linear-gradient(135deg,var(--accent-start),var(--accent-mid)_55%,var(--accent-end))] shadow-[0_0_18px_var(--accent-shadow)] transition-transform duration-300 ease-out"
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
                    'relative z-10 inline-flex h-8 min-w-11 items-center justify-center rounded-[12px] px-3 font-[IBM_Plex_Mono] text-[0.68rem] font-semibold uppercase tracking-[0.16em] transition',
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

      <main className={[
        'relative z-10 mx-auto p-2',
        location.pathname === '/' ? 'max-w-[1180px]' : 'max-w-[1880px]',
      ].join(' ')}>
        <Routes>
          <Route
            path="/"
            element={(
              <LandingPage
                language={app.language}
                t={app.t}
                sessionEmail={app.session?.user.email}
                conversationList={conversationSummaries}
                onOpenNewConversation={app.openNewConversationModal}
                onSelectConversation={(conversationId) => {
                  app.setActiveConversationId(conversationId)
                  app.setDraft('')
                  goToChatWithAuthGate()
                }}
                onPrimaryAction={goToChatWithAuthGate}
                onSecondaryAction={() => {
                  app.setDraft(app.t.quickPrompts[1])
                  goToChatWithAuthGate()
                }}
                onAccountAction={() => navigate(app.session ? '/profile' : '/auth')}
                onQuickPromptAction={(prompt) => {
                  void app.submitMessage(prompt)
                  goToChatWithAuthGate()
                }}
              />
            )}
          />
          <Route
            path="/auth"
            element={(
              <AuthPage
                language={app.language}
                isSupabaseConfigured={app.isSupabaseConfigured}
                authEmail={app.authEmail}
                authPassword={app.authPassword}
                authError={app.authError}
                isAuthBusy={app.isAuthBusy}
                onAuthEmailChange={app.setAuthEmail}
                onAuthPasswordChange={app.setAuthPassword}
                onSignInWithGoogle={() => { void app.signInWithGoogle(app.language) }}
                onSignInWithEmail={() => { void app.signInWithEmail(app.authEmail, app.authPassword, app.language) }}
                onSignUpWithEmail={() => { void app.signUpWithEmail(app.authEmail, app.authPassword, app.language) }}
                onBack={() => navigate('/')}
              />
            )}
          />
          <Route
            path="/profile"
            element={(
              <ProfilePage
                language={app.language}
                email={app.session?.user.email}
                userPlan={app.userPlan}
                isCloudSyncEnabled={app.isCloudSyncEnabled}
                onToggleCloudSync={() => app.setIsCloudSyncEnabled((current) => !current)}
                onSignOut={() => {
                  void app.signOutFromCloud()
                  navigate('/auth')
                }}
                onBackToChat={() => navigate('/chat')}
              />
            )}
          />
          <Route
            path="/chat"
            element={(
              <ChatPage
                workspaceValue={{
                  language: app.language,
                  t: app.t,
                  isDesktopSidebarPinned: app.isDesktopSidebarPinned,
                  isDesktopSidebarOpen: app.isDesktopSidebarOpen,
                  setIsDesktopSidebarPinned: app.setIsDesktopSidebarPinned,
                  setIsDesktopSidebarHovered: app.setIsDesktopSidebarHovered,
                  isMobileConversationMenuOpen: app.isMobileConversationMenuOpen,
                  setIsMobileConversationMenuOpen: app.setIsMobileConversationMenuOpen,
                  openNewConversationModal: app.openNewConversationModal,
                  isLoading: app.isLoading,
                  conversationList: conversationSummaries,
                  activeConversationId: app.activeConversationId,
                  setActiveConversationId: app.setActiveConversationId,
                  responseModeOptions,
                  responseMode: app.responseMode,
                  setResponseMode: app.setResponseMode,
                  responseModeLabel,
                  setScreen,
                  sessionEmail: app.session?.user.email,
                  showStickyPassagePanel: app.showStickyPassagePanel,
                  examPassage: app.activeConversation?.examPassage,
                  visibleMessages: app.visibleMessages,
                  selectQuizOption: app.selectQuizOption,
                  selectTrueFalseOption: app.selectTrueFalseOption,
                  retryAssistantMessage: app.retryAssistantMessage,
                  nowMs: app.nowMs,
                  markdownComponents,
                  markdownInlineComponents,
                  activeConversation: app.activeConversation,
                  generateExamQuestion: app.generateExamQuestion,
                  hasPendingExamMessage: app.hasPendingExamMessage,
                  draft: app.draft,
                  setDraft: app.setDraft,
                  resizeDraftTextarea: app.resizeDraftTextarea,
                  draftTextareaRef: app.draftTextareaRef,
                  handleSubmit: app.handleSubmit,
                  userPlan: app.userPlan,
                  isCloudSyncEnabled: app.isCloudSyncEnabled,
                  setIsCloudSyncEnabled: app.setIsCloudSyncEnabled,
                  cloudSyncTimeText: app.cloudSyncTimeText,
                  signOutFromCloud: app.signOutFromCloud,
                  authEmail: app.authEmail,
                  setAuthEmail: app.setAuthEmail,
                  authPassword: app.authPassword,
                  setAuthPassword: app.setAuthPassword,
                  authError: app.authError,
                  isAuthBusy: app.isAuthBusy,
                  signInWithGoogle: app.signInWithGoogle,
                  signInWithEmail: app.signInWithEmail,
                  signUpWithEmail: app.signUpWithEmail,
                }}
              />
            )}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <NewConversationModal
        language={app.language}
        isOpen={app.isNewConversationModalOpen}
        mode={app.newConversationMode}
        topic={app.newConversationTopic}
        examProfile={app.newConversationExamProfile}
        examFlow={app.newConversationExamFlow}
        difficulty={app.newConversationDifficulty}
        conversationModeLabel={conversationModeLabel}
        examProfileLabel={examProfileLabel}
        examFlowLabel={examFlowLabel}
        difficultyLabel={difficultyLabel}
        onModeChange={app.setNewConversationMode}
        onTopicChange={app.setNewConversationTopic}
        onExamProfileChange={app.setNewConversationExamProfile}
        onExamFlowChange={app.setNewConversationExamFlow}
        onDifficultyChange={app.setNewConversationDifficulty}
        onCancel={app.closeNewConversationModal}
        onCreate={() => {
          void app.startNewConversation().then((result) => {
            if (result === 'auth_required') {
              navigate('/auth')
              return
            }

            navigate('/chat')
          })
        }}
      />
    </div>
  )
}

export default App
