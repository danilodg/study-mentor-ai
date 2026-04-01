import { ArrowLeft } from 'lucide-react'
import { useChatWorkspaceContext } from '../../context/ChatWorkspaceContext'

export function MobileDrawer() {
  const {
    language,
    t,
    isMobileConversationMenuOpen,
    setIsMobileConversationMenuOpen,
    setScreen,
    conversationList,
    activeConversationId,
    setActiveConversationId,
    openNewConversationModal,
    responseModeOptions,
    responseMode,
    setResponseMode,
    responseModeLabel,
  } = useChatWorkspaceContext()

  if (!isMobileConversationMenuOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-40 bg-black/45 lg:hidden"
      onClick={() => setIsMobileConversationMenuOpen(false)}
    >
      <aside
        className="glass-panel app-scroll absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col overflow-y-auto rounded-r-[28px] p-3"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 border-b border-[color:var(--panel-border)] pb-3">
          <button
            type="button"
            onClick={() => setIsMobileConversationMenuOpen(false)}
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--card-border)] px-3 py-1.5 text-xs font-medium text-[color:var(--text-main)]"
          >
            <ArrowLeft size={14} />
            {language === 'pt' ? 'Voltar' : 'Back'}
          </button>
          <button
            type="button"
            onClick={() => {
              setScreen('landing')
              setIsMobileConversationMenuOpen(false)
            }}
            className="inline-flex items-center rounded-full border border-[color:var(--card-border)] px-3 py-1.5 text-xs font-medium text-[color:var(--text-main)]"
          >
            {language === 'pt' ? 'Inicio' : 'Home'}
          </button>
        </div>

        <section className="mt-3 rounded-[24px] border border-[color:var(--card-border)] p-2">
          <div className="flex items-center justify-between gap-2">
            <span className="section-label">{language === 'pt' ? 'Conversas' : 'Conversations'}</span>
            <button
              type="button"
              onClick={() => {
                openNewConversationModal()
                setIsMobileConversationMenuOpen(false)
              }}
              className="inline-flex items-center rounded-full border border-[color:var(--card-border)] px-3 py-1.5 text-xs font-medium text-[color:var(--text-main)]"
            >
              {t.newChat}
            </button>
          </div>

          <div className="mt-3 grid min-w-0 gap-2">
            {conversationList.map((conversation, index) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => {
                  setActiveConversationId(conversation.id)
                  setIsMobileConversationMenuOpen(false)
                }}
                className={[
                  'glass-card w-full min-w-0 rounded-[18px] p-2 text-left',
                  conversation.id === activeConversationId ? 'border-[color:var(--accent-line)]/45' : '',
                ].join(' ')}
              >
                <p className="text-sm font-medium break-words text-[color:var(--text-main)]">
                  {conversation.title || `${t.newChat} ${conversationList.length - index}`}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-2 rounded-[24px] border border-[color:var(--card-border)] p-2">
          <span className="section-label">{language === 'pt' ? 'Tipo de resposta' : 'Response type'}</span>
          <div className="mt-2 grid gap-2">
            {responseModeOptions.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setResponseMode(mode)}
                className={[
                  'rounded-[14px] border px-2 py-2 text-left text-sm',
                  responseMode === mode
                    ? 'border-[color:var(--accent-line)]/55 bg-[color:var(--input-bg)] text-[color:var(--text-main)]'
                    : 'border-[color:var(--card-border)] bg-transparent text-[color:var(--text-soft)]',
                ].join(' ')}
              >
                {responseModeLabel[language][mode]}
              </button>
            ))}
          </div>
        </section>
      </aside>
    </div>
  )
}
