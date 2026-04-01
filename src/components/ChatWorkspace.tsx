import type { FormEvent, RefObject } from 'react'
import type { Components } from 'react-markdown'
import { ChatHeader } from './chat/ChatHeader'
import { ChatMessageList } from './chat/ChatMessageList'
import { DesktopSidebar } from './chat/DesktopSidebar'
import { MobileDrawer } from './chat/MobileDrawer'
import type { Conversation, CopyBlock, Message, QuizOptionId, ResponseMode, Screen } from '../types/chat'

interface ChatWorkspaceProps {
  language: 'pt' | 'en'
  t: CopyBlock
  isDesktopSidebarPinned: boolean
  isDesktopSidebarOpen: boolean
  setIsDesktopSidebarPinned: (updater: (current: boolean) => boolean) => void
  setIsDesktopSidebarHovered: (value: boolean) => void
  isMobileConversationMenuOpen: boolean
  setIsMobileConversationMenuOpen: (value: boolean) => void
  openNewConversationModal: () => void
  isLoading: boolean
  conversationList: Array<{ id: string; title: string }>
  activeConversationId: string
  setActiveConversationId: (id: string) => void
  responseModeOptions: ResponseMode[]
  responseMode: ResponseMode
  setResponseMode: (mode: ResponseMode) => void
  responseModeLabel: Record<'pt' | 'en', Record<ResponseMode, string>>
  setScreen: (screen: Screen) => void
  sessionEmail?: string
  showStickyPassagePanel: boolean
  examPassage?: string
  visibleMessages: Message[]
  selectQuizOption: (messageId: string, optionId: QuizOptionId) => void
  selectTrueFalseOption: (messageId: string, selectedValue: boolean) => void
  retryAssistantMessage: (message: Message) => Promise<void>
  nowMs: number
  markdownComponents: Components
  markdownInlineComponents: Components
  activeConversation?: Conversation
  generateExamQuestion: (conversationId: string, nextQuestionNumber: number) => Promise<void>
  hasPendingExamMessage: boolean
  draft: string
  setDraft: (value: string) => void
  resizeDraftTextarea: (element: HTMLTextAreaElement) => void
  draftTextareaRef: RefObject<HTMLTextAreaElement | null>
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
  userPlan: 'free' | 'pro'
  isCloudSyncEnabled: boolean
  setIsCloudSyncEnabled: (updater: (current: boolean) => boolean) => void
  cloudSyncTimeText: string
  signOutFromCloud: () => Promise<void>
  authEmail: string
  setAuthEmail: (value: string) => void
  authPassword: string
  setAuthPassword: (value: string) => void
  authError: string
  isAuthBusy: boolean
  signInWithGoogle: (language: 'pt' | 'en') => Promise<void>
  signInWithEmail: (email: string, password: string, language: 'pt' | 'en') => Promise<void>
  signUpWithEmail: (email: string, password: string, language: 'pt' | 'en') => Promise<void>
}

export function ChatWorkspace(props: ChatWorkspaceProps) {
  const {
    language,
    t,
    isDesktopSidebarPinned,
    isDesktopSidebarOpen,
    setIsDesktopSidebarPinned,
    setIsDesktopSidebarHovered,
    isMobileConversationMenuOpen,
    setIsMobileConversationMenuOpen,
    openNewConversationModal,
    isLoading,
    conversationList,
    activeConversationId,
    setActiveConversationId,
    responseModeOptions,
    responseMode,
    setResponseMode,
    responseModeLabel,
    setScreen,
    sessionEmail,
    showStickyPassagePanel,
    examPassage,
    visibleMessages,
    selectQuizOption,
    selectTrueFalseOption,
    retryAssistantMessage,
    nowMs,
    markdownComponents,
    markdownInlineComponents,
    activeConversation,
    generateExamQuestion,
    hasPendingExamMessage,
    draft,
    setDraft,
    resizeDraftTextarea,
    draftTextareaRef,
    handleSubmit,
    userPlan,
    isCloudSyncEnabled,
    setIsCloudSyncEnabled,
    cloudSyncTimeText,
    signOutFromCloud,
    authEmail,
    setAuthEmail,
    authPassword,
    setAuthPassword,
    authError,
    isAuthBusy,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
  } = props

  return (
    <>
      <div className={[
        'grid h-[calc(100dvh-1rem)] gap-2 overflow-hidden lg:h-[calc(100vh-2rem)] lg:overflow-visible',
        isDesktopSidebarPinned
          ? 'lg:grid-cols-[420px_minmax(0,1fr)]'
          : 'lg:grid-cols-[88px_minmax(0,1fr)]',
      ].join(' ')}>
        <section className="lg:glass-panel lg:order-2 flex min-h-0 flex-col px-0 pb-0 pt-0 sm:px-0 sm:pb-0 sm:pt-0 lg:rounded-[28px] lg:px-3 lg:pb-3 lg:pt-3">
          <ChatHeader
            language={language}
            brandLabel={t.brandLabel}
            workspaceTitle={t.workspaceTitle}
            chatBadge={t.chatBadge}
            sessionEmail={sessionEmail}
            onOpenMobileMenu={() => setIsMobileConversationMenuOpen(true)}
            onOpenAccount={() => setScreen(sessionEmail ? 'profile' : 'auth')}
            onBack={() => setScreen('landing')}
          />

          <ChatMessageList
            language={language}
            showStickyPassagePanel={showStickyPassagePanel}
            examPassage={examPassage}
            visibleMessages={visibleMessages}
            selectQuizOption={selectQuizOption}
            selectTrueFalseOption={selectTrueFalseOption}
            retryAssistantMessage={retryAssistantMessage}
            nowMs={nowMs}
            markdownComponents={markdownComponents}
            markdownInlineComponents={markdownInlineComponents}
            activeConversation={activeConversation}
            generateExamQuestion={generateExamQuestion}
            hasPendingExamMessage={hasPendingExamMessage}
            isLoading={isLoading}
            draft={draft}
            setDraft={setDraft}
            resizeDraftTextarea={resizeDraftTextarea}
            draftTextareaRef={draftTextareaRef}
            handleSubmit={handleSubmit}
          />
        </section>

        <DesktopSidebar
          language={language}
          isDesktopSidebarOpen={isDesktopSidebarOpen}
          setIsDesktopSidebarPinned={setIsDesktopSidebarPinned}
          setIsDesktopSidebarHovered={setIsDesktopSidebarHovered}
          openNewConversationModal={openNewConversationModal}
          isLoading={isLoading}
          conversationList={conversationList}
          activeConversationId={activeConversationId}
          setActiveConversationId={setActiveConversationId}
          responseModeOptions={responseModeOptions}
          responseMode={responseMode}
          setResponseMode={setResponseMode}
          responseModeLabel={responseModeLabel}
          newChatLabel={t.newChat}
          userPlan={userPlan}
          isCloudSyncEnabled={isCloudSyncEnabled}
          setIsCloudSyncEnabled={setIsCloudSyncEnabled}
          cloudSyncTimeText={cloudSyncTimeText}
          sessionEmail={sessionEmail}
          signOutFromCloud={signOutFromCloud}
          authEmail={authEmail}
          setAuthEmail={setAuthEmail}
          authPassword={authPassword}
          setAuthPassword={setAuthPassword}
          authError={authError}
          isAuthBusy={isAuthBusy}
          signInWithGoogle={signInWithGoogle}
          signInWithEmail={signInWithEmail}
          signUpWithEmail={signUpWithEmail}
        />
      </div>

      <MobileDrawer
        language={language}
        isOpen={isMobileConversationMenuOpen}
        onClose={() => setIsMobileConversationMenuOpen(false)}
        onGoHome={() => {
          setScreen('landing')
          setIsMobileConversationMenuOpen(false)
        }}
        conversationList={conversationList}
        activeConversationId={activeConversationId}
        onSelectConversation={(conversationId) => {
          setActiveConversationId(conversationId)
          setIsMobileConversationMenuOpen(false)
        }}
        onOpenNewConversation={() => {
          openNewConversationModal()
          setIsMobileConversationMenuOpen(false)
        }}
        newChatLabel={t.newChat}
        responseModeOptions={responseModeOptions}
        responseMode={responseMode}
        setResponseMode={setResponseMode}
        responseModeLabel={responseModeLabel}
      />
    </>
  )
}
