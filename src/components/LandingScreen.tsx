import { BookOpenText, BrainCircuit, ClipboardList } from 'lucide-react'

interface LandingConversation {
  id: string
  title: string
}

interface LandingCopy {
  newChat: string
  brandLabel: string
  heroTitle: string
  heroDescription: string
  primaryCta: string
  secondaryCta: string
  workspaceTitle: string
  researchTitle: string
  progressTitle: string
  featuredLabel: string
  featuredItems: string[]
  chatBadge: string
  previewAssistantText: string
  previewUserText: string
  featuredTitle: string
  metricItems: Array<{ value: string; label: string }>
  quickPrompts: string[]
}

interface LandingScreenProps {
  language: 'pt' | 'en'
  t: LandingCopy
  sessionEmail?: string
  conversationList: LandingConversation[]
  onOpenNewConversation: () => void
  onSelectConversation: (conversationId: string) => void
  onPrimaryAction: () => void
  onSecondaryAction: () => void
  onAccountAction: () => void
  onQuickPromptAction: (prompt: string) => void
}

export function LandingScreen({
  language,
  t,
  sessionEmail,
  conversationList,
  onOpenNewConversation,
  onSelectConversation,
  onPrimaryAction,
  onSecondaryAction,
  onAccountAction,
  onQuickPromptAction,
}: LandingScreenProps) {
  return (
    <>
      <div className="pointer-events-none fixed left-4 top-24 z-20 hidden w-72 2xl:block">
        <aside className="pointer-events-auto glass-panel max-h-[calc(100vh-8rem)] overflow-y-auto overflow-x-hidden rounded-[28px] p-2 sm:p-3">
          <span className="section-label">{language === 'pt' ? 'Selecione conversa' : 'Select conversation'}</span>
          <h2 className="mt-3 font-['Space_Grotesk'] text-[1.3rem] font-bold tracking-[-0.03em] text-[color:var(--text-main)]">
            {language === 'pt' ? 'Conversas ja existentes' : 'Existing conversations'}
          </h2>

          <button
            type="button"
            onClick={onOpenNewConversation}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-[color:var(--card-border)] bg-transparent px-3 py-2 text-sm font-medium text-[color:var(--text-main)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent-line)]"
          >
            {t.newChat}
          </button>

          <div className="mt-5 grid min-w-0 gap-3">
            {conversationList.length > 0 ? conversationList.map((conversation, index) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => onSelectConversation(conversation.id)}
                className="glass-card w-full min-w-0 rounded-[20px] border border-[color:var(--card-border)] bg-transparent p-2 text-left transition hover:-translate-y-0.5"
              >
                <p className="text-sm font-medium break-words text-[color:var(--text-main)]">
                  {conversation.title || `${t.newChat} ${conversationList.length - index}`}
                </p>
              </button>
            )) : (
              <article className="glass-card rounded-[20px] p-2 text-sm leading-6 text-[color:var(--text-muted)]">
                {language === 'pt'
                  ? 'Ainda nao existem conversas salvas. Inicie uma mentoria para aparecer aqui.'
                  : 'No saved conversations yet. Start mentoring to see them here.'}
              </article>
            )}
          </div>
        </aside>
      </div>

      <section className="glass-panel rounded-[28px] px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.06fr)_minmax(340px,0.94fr)] lg:items-center">
          <div>
            <span className="section-label">{t.brandLabel}</span>
            <h1 className="mt-3 max-w-[11ch] font-['Space_Grotesk'] text-[clamp(2.55rem,7vw,4.85rem)] font-bold leading-[0.96] tracking-[-0.05em] text-[color:var(--text-main)]">
              {t.heroTitle}
            </h1>
            <p className="mt-3 max-w-[38rem] text-base leading-7 text-[color:var(--text-soft)] sm:text-[1.05rem]">
              {t.heroDescription}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onPrimaryAction}
                className="accent-aura accent-button rounded-full px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                {t.primaryCta}
              </button>
              <button
                type="button"
                onClick={onSecondaryAction}
                className="rounded-full border border-[color:var(--card-border)] bg-transparent px-3 py-2 text-sm font-medium text-[color:var(--text-main)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent-line)]"
              >
                {t.secondaryCta}
              </button>
              <button
                type="button"
                onClick={onAccountAction}
                className="rounded-full border border-[color:var(--card-border)] bg-transparent px-3 py-2 text-sm font-medium text-[color:var(--text-main)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent-line)]"
              >
                {sessionEmail
                  ? (language === 'pt' ? 'Conta conectada' : 'Account connected')
                  : (language === 'pt' ? 'Entrar / criar conta' : 'Sign in / create account')}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {[t.workspaceTitle, t.researchTitle, t.progressTitle].map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-[color:var(--card-border)] bg-transparent px-3.5 py-2.5 font-['IBM_Plex_Mono'] text-[0.72rem] uppercase tracking-[0.14em] text-[color:var(--text-soft)]"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="relative hidden min-h-[460px] overflow-visible lg:block">
            <div className="absolute left-0 top-14 z-20 w-[56%] rounded-[28px] border border-[color:var(--card-border)] bg-[#0d1430] p-2 shadow-[0_18px_60px_rgba(7,12,32,0.38)]">
              <span className="font-['IBM_Plex_Mono'] text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--accent-soft)]">
                {t.featuredLabel}
              </span>
              <div className="mt-4 h-24 rounded-[22px] border border-[color:var(--card-border)] bg-[#121b40]" />
              <div className="mt-4 space-y-2.5">
                {t.featuredItems.map((item) => (
                  <div key={item} className="rounded-full border border-[color:var(--card-border)] bg-[#121b40] px-3 py-2 text-sm text-[color:var(--text-soft)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute right-0 top-0 z-30 w-[68%] rounded-[28px] border border-[color:var(--card-border)] bg-[#111938] p-2 shadow-[0_22px_65px_rgba(7,12,32,0.42)]">
              <div className="flex items-center justify-between gap-3">
                <span className="font-['IBM_Plex_Mono'] text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--accent-soft)]">
                  {t.chatBadge}
                </span>
                <div className="flex gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--accent-line)]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/35" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                </div>
              </div>
              <div className="mt-3 rounded-[22px] border border-[color:var(--card-border)] bg-[#16214a] p-2">
                <p className="font-['IBM_Plex_Mono'] text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Mentor AI</p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">{t.previewAssistantText}</p>
              </div>
              <div className="mt-2 rounded-[22px] border border-[color:var(--card-border)] bg-[#1a2858] p-2">
                <p className="font-['IBM_Plex_Mono'] text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                  {language === 'pt' ? 'Voce' : 'You'}
                </p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">{t.previewUserText}</p>
              </div>
            </div>

            <div className="absolute left-[12%] top-60 z-40 w-[64%] rounded-[28px] border border-[color:var(--card-border)] bg-[#0f1736] p-2 shadow-[0_20px_60px_rgba(7,12,32,0.38)]">
              <h2 className="font-['Space_Grotesk'] text-[1.18rem] font-bold tracking-[-0.03em] text-[color:var(--text-main)]">
                {t.featuredTitle}
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {t.metricItems.map((metric) => (
                  <div key={metric.label} className="rounded-[20px] border border-[color:var(--card-border)] bg-[#16214a] p-3.5">
                    <p className="font-['Space_Grotesk'] text-[1.35rem] font-bold tracking-[-0.04em] text-[color:var(--text-main)]">
                      {metric.value}
                    </p>
                    <p className="mt-1.5 text-sm leading-5 text-[color:var(--text-muted)]">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-3 grid gap-2 md:grid-cols-3">
        {t.metricItems.map((metric, index) => (
          <article key={metric.label} className="glass-card rounded-[24px] p-2">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-[18px] bg-transparent text-[color:var(--accent-soft)]">
              {index === 0 ? <BrainCircuit size={18} /> : index === 1 ? <BookOpenText size={18} /> : <ClipboardList size={18} />}
            </div>
            <p className="font-['Space_Grotesk'] text-[1.6rem] font-bold tracking-[-0.04em] text-[color:var(--text-main)]">
              {metric.value}
            </p>
            <p className="mt-1.5 text-sm leading-6 text-[color:var(--text-muted)]">{metric.label}</p>
          </article>
        ))}
      </div>

      <section className="mt-3 glass-panel rounded-[28px] p-2 sm:p-3 lg:p-3">
        <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.82fr)] lg:items-start">
          <div>
            <span className="section-label">{t.progressTitle}</span>
            <h2 className="mt-3 max-w-[14ch] font-['Space_Grotesk'] text-[clamp(1.9rem,4vw,3rem)] font-bold leading-[0.98] tracking-[-0.05em] text-[color:var(--text-main)]">
              {language === 'pt' ? 'Uma tela inicial para apresentar o produto antes do chat.' : 'A landing introduces the product before the chat.'}
            </h2>
          </div>
          <div className="grid gap-3">
            {t.quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => onQuickPromptAction(prompt)}
                className="glass-card rounded-[22px] p-2 text-left text-sm leading-6 text-[color:var(--text-soft)] transition hover:-translate-y-0.5 hover:text-[color:var(--text-main)]"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
