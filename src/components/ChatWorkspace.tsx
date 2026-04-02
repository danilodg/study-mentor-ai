import { ChatHeader } from './chat/ChatHeader'
import { ChatMessageList } from './chat/ChatMessageList'
import { DesktopSidebar } from './chat/DesktopSidebar'
import { MobileDrawer } from './chat/MobileDrawer'
import { useChatWorkspaceContext } from '../context/ChatWorkspaceContext'

export function ChatWorkspace() {
  const { isDesktopSidebarOpen } = useChatWorkspaceContext()

  return (
    <>
      <div className={[
        'grid h-[calc(100dvh-1rem)] gap-2 overflow-hidden lg:h-[calc(100vh-2rem)] lg:overflow-visible lg:transition-[grid-template-columns] lg:duration-300 lg:ease-out',
        isDesktopSidebarOpen
          ? 'lg:grid-cols-[320px_minmax(0,1fr)]'
          : 'lg:grid-cols-[60px_minmax(0,1fr)]',
      ].join(' ')}>
        <section className="lg:glass-panel lg:order-2 flex min-h-0 flex-col px-0 pb-0 pt-0 sm:px-0 sm:pb-0 sm:pt-0 lg:rounded-[10px] lg:px-0 lg:pb-0 lg:pt-0">
          <ChatHeader />

          <ChatMessageList />
        </section>

        <DesktopSidebar />
      </div>

      <MobileDrawer />
    </>
  )
}
