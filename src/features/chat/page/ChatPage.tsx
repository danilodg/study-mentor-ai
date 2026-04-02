import { ChatWorkspace } from '../../../components/ChatWorkspace'
import { responseModeLabel, responseModeOptions } from '../../../content/copy'
import { useAppContext } from '../../../context/AppContext'
import { ChatWorkspaceProvider } from '../../../context/ChatWorkspaceContext'
import { getSessionDisplayName } from '../../../utils/user'
import { markdownComponents, markdownInlineComponents } from '../../../utils/markdown'

export function ChatPage() {
  const { app, conversationSummaries } = useAppContext()

  return (
    <ChatWorkspaceProvider value={{
      language: app.language,
      switchLanguage: app.switchLanguage,
      theme: app.theme,
      setTheme: app.setTheme,
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
      deleteConversation: app.deleteConversation,
      responseModeOptions,
      responseMode: app.responseMode,
      setResponseMode: app.setResponseMode,
      responseModeLabel,
      sessionEmail: app.session?.user.email,
      sessionDisplayName: getSessionDisplayName(app.session),
      showStickyPassagePanel: app.showStickyPassagePanel,
      examPassage: app.activeConversation?.examPassage,
      visibleMessages: app.visibleMessages,
      selectQuizOption: app.selectQuizOption,
      selectTrueFalseOption: app.selectTrueFalseOption,
      submitOrderingAnswer: app.submitOrderingAnswer,
      submitMatchPairsAnswer: app.submitMatchPairsAnswer,
      submitClozeAnswer: app.submitClozeAnswer,
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
    }}>
      <ChatWorkspace />
    </ChatWorkspaceProvider>
  )
}
