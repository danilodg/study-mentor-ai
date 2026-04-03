import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { ArrowUp, CheckSquare2, EllipsisVertical, FileText, Settings2, ToggleLeft } from 'lucide-react'
import { useChatWorkspaceContext } from '../../context/ChatWorkspaceContext'
import type { Message, ResponseMode } from '../../types/chat'

export function ChatMessageList() {
  const [isResponseMenuOpen, setIsResponseMenuOpen] = useState(false)
  const responseMenuRef = useRef<HTMLDivElement | null>(null)
  const [messageMenuOpenId, setMessageMenuOpenId] = useState<string | null>(null)
  const messageMenuRef = useRef<HTMLDivElement | null>(null)
  const scrollRootRef = useRef<HTMLDivElement | null>(null)
  const firstQuestionRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const [orderingDrafts, setOrderingDrafts] = useState<Record<string, string[]>>({})
  const [matchDrafts, setMatchDrafts] = useState<Record<string, Record<string, string>>>({})
  const [clozeDrafts, setClozeDrafts] = useState<Record<string, Record<string, string>>>({})
  const [passageStartOffsets, setPassageStartOffsets] = useState<Record<number, number>>({})
  const {
    language,
    showStickyPassagePanel,
    examPassageHistory,
    visibleMessages,
    selectQuizOption,
    selectTrueFalseOption,
    submitOrderingAnswer,
    submitMatchPairsAnswer,
    submitClozeAnswer,
    retryAssistantMessage,
    nowMs,
    markdownComponents,
    markdownInlineComponents,
    activeConversation,
    generateExamQuestion,
    hasPendingExamMessage,
    isLoading,
    draft,
    setDraft,
    resizeDraftTextarea,
    draftTextareaRef,
    handleSubmit,
    responseMode,
    setResponseMode,
    responseModeOptions,
    responseModeLabel,
  } = useChatWorkspaceContext()

  useEffect(() => {
    if (!isResponseMenuOpen) {
      return
    }

    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node
      if (!responseMenuRef.current?.contains(target)) {
        setIsResponseMenuOpen(false)
      }
    }

    window.addEventListener('mousedown', handleOutsideClick)
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isResponseMenuOpen])

  useEffect(() => {
    if (!messageMenuOpenId) {
      return
    }

    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node

      if (!messageMenuRef.current?.contains(target)) {
        setMessageMenuOpenId(null)
      }
    }

    window.addEventListener('mousedown', handleOutsideClick)
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [messageMenuOpenId])

  useEffect(() => {
    if (!showStickyPassagePanel) {
      return
    }

    const root = scrollRootRef.current

    if (!root) {
      return
    }

    const updateOffsets = () => {
      const rootRect = root.getBoundingClientRect()
      const nextOffsets: Record<number, number> = {}

      for (let index = 0; index < examPassageHistory.length; index += 1) {
        const anchor = firstQuestionRefs.current[index]

        if (!anchor) {
          continue
        }

        const anchorRect = anchor.getBoundingClientRect()
        nextOffsets[index] = Math.max(0, (anchorRect.top - rootRect.top) + root.scrollTop)
      }

      setPassageStartOffsets(nextOffsets)
    }

    updateOffsets()
    root.addEventListener('scroll', updateOffsets)
    window.addEventListener('resize', updateOffsets)

    return () => {
      root.removeEventListener('scroll', updateOffsets)
      window.removeEventListener('resize', updateOffsets)
    }
  }, [examPassageHistory.length, showStickyPassagePanel, visibleMessages])


  async function copyMessageText(text: string) {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      return
    }

    await navigator.clipboard.writeText(text)
  }

  function getResponseModeIcon(mode: ResponseMode) {
    if (mode === 'quiz_mcq') {
      return <CheckSquare2 size={16} />
    }
    if (mode === 'true_false') {
      return <ToggleLeft size={16} />
    }
    if (mode === 'short_answer') {
      return <FileText size={16} />
    }

    return <Settings2 size={16} />
  }

  function updateOrderingSelection(messageId: string, currentOrder: string[], position: number, nextItem: string) {
    const next = [...currentOrder]
    const previousIndex = next.findIndex((item) => item === nextItem)

    if (previousIndex >= 0) {
      const currentAtPosition = next[position]
      next[previousIndex] = currentAtPosition
    }

    next[position] = nextItem
    setOrderingDrafts((drafts) => ({ ...drafts, [messageId]: next }))
  }

  function parseClozeTokens(text: string) {
    const tokenPattern = /(\{\{([^}]+)\}\}|__([^_]+)__|\[\[([^\]]+)\]\])/g
    const tokens: Array<{ type: 'text' | 'blank'; value: string }> = []
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = tokenPattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({ type: 'text', value: text.slice(lastIndex, match.index) })
      }

      const blankId = (match[2] ?? match[3] ?? match[4] ?? '').trim()
      tokens.push({ type: 'blank', value: blankId })
      lastIndex = match.index + match[0].length
    }

    if (lastIndex < text.length) {
      tokens.push({ type: 'text', value: text.slice(lastIndex) })
    }

    return tokens
  }

  function isExamQuestionMessage(message: Message) {
    return Boolean(
      message.quiz
      || message.trueFalse
      || message.shortAnswer
      || message.ordering
      || message.matchPairs
      || message.cloze,
    )
  }

  function isExamQuestionAnswered(message: Message) {
    if (message.quiz) {
      return Boolean(message.selectedOptionId)
    }

    if (message.trueFalse) {
      return typeof message.selectedTrueFalse === 'boolean'
    }

    if (message.ordering) {
      return Boolean(message.orderingSubmitted)
    }

    if (message.matchPairs) {
      return Boolean(message.matchPairsSubmitted)
    }

    if (message.cloze) {
      return Boolean(message.clozeSubmitted)
    }

    if (message.shortAnswer) {
      return true
    }

    return false
  }

  function isLikelyInvalidExamPayload(message: Message) {
    if (message.role !== 'assistant' || message.responseType !== 'text') {
      return false
    }

    const normalized = message.text.trim().toLowerCase()

    if (!normalized) {
      return false
    }

    return (
      normalized.startsWith('{')
      || normalized.startsWith('```json')
      || (normalized.includes('"type"') && (
        normalized.includes('quiz_mcq')
        || normalized.includes('true_false')
        || normalized.includes('short_answer')
      ))
    )
  }

  function getRetryCandidate(message: Message): Message | null {
    if (message.role !== 'assistant') {
      return null
    }

    if (message.retryAction) {
      return message
    }

    if (!activeConversation) {
      return null
    }

    const conversationMessages = activeConversation.messages
    const messageIndex = conversationMessages.findIndex((item) => item.id === message.id)

    if (messageIndex < 0) {
      return null
    }

    if (activeConversation.mode === 'exam') {
      const isStructuredQuestion = isExamQuestionMessage(message)
      const isInvalidPayload = isLikelyInvalidExamPayload(message)

      if (!isStructuredQuestion && !isInvalidPayload) {
        return null
      }

      const retryQuestionNumber = conversationMessages
        .slice(0, messageIndex + 1)
        .filter((item) => item.role === 'assistant' && (isExamQuestionMessage(item) || isLikelyInvalidExamPayload(item)))
        .length

      if (retryQuestionNumber <= 0) {
        return null
      }

      return {
        ...message,
        retryAction: 'exam' as const,
        retryQuestionNumber,
      }
    }

    const previousUserMessage = conversationMessages
      .slice(0, messageIndex)
      .reverse()
      .find((item) => item.role === 'user' && item.text.trim())

    if (!previousUserMessage) {
      return null
    }

    return {
      ...message,
      retryAction: 'chat' as const,
      retrySourceText: previousUserMessage.text,
    }
  }

  const questionsPerPassage = activeConversation?.examFlow === 'passage'
    ? Math.max(activeConversation.examQuestionTarget || 4, 1)
    : 1
  const messagePassageSetIndexById: Record<string, number> = {}
  const passageQuestionCounts = examPassageHistory.map(() => 0)
  let inferredQuestionCount = 0

  for (const message of visibleMessages) {
    const isExamQuestion = message.role === 'assistant' && (
      isExamQuestionMessage(message)
      || isLikelyInvalidExamPayload(message)
    )

    if (!isExamQuestion) {
      continue
    }

    const inferredSetIndex = Math.floor(inferredQuestionCount / questionsPerPassage)
    const setIndex = typeof message.examPassageSetIndex === 'number'
      ? message.examPassageSetIndex
      : inferredSetIndex

    messagePassageSetIndexById[message.id] = setIndex

    if (passageQuestionCounts[setIndex] !== undefined) {
      passageQuestionCounts[setIndex] += 1
    }

    inferredQuestionCount += 1
  }

  const firstQuestionMessageBySet: Record<number, string> = {}

  for (const message of visibleMessages) {
    const setIndex = messagePassageSetIndexById[message.id]
    const isFirstEligible = message.role === 'assistant' && (isExamQuestionMessage(message) || isLikelyInvalidExamPayload(message))

    if (!isFirstEligible || typeof setIndex !== 'number') {
      continue
    }

    if (!firstQuestionMessageBySet[setIndex]) {
      firstQuestionMessageBySet[setIndex] = message.id
    }
  }

  return (
    <div className="mt-2 min-h-0 flex-1 overflow-hidden sm:mt-3 lg:mt-4">
      <div ref={scrollRootRef} className="app-scroll mx-auto flex h-full min-h-0 w-full max-w-[980px] flex-col overflow-y-auto lg:flex-row lg:gap-2">
        {showStickyPassagePanel ? (
          <aside className="glass-card hidden w-[350px] shrink-0 overflow-visible rounded-[10px] border border-[color:var(--card-border)] bg-transparent p-2 lg:block">
            <p className="font-['IBM_Plex_Mono'] text-[0.66rem] uppercase tracking-[0.14em] text-[color:var(--accent-soft)]">
              {language === 'pt' ? 'Textos-base' : 'Base passages'}
            </p>
            <div className="mt-2">
              <div className="grid gap-2">
                {examPassageHistory.map((passage, index) => {
                  const questionCount = Math.max(passageQuestionCounts[index] || 0, 1)
                  const currentTop = passageStartOffsets[index] ?? 0
                  const nextTop = passageStartOffsets[index + 1]
                  const measuredHeight = typeof nextTop === 'number' ? nextTop - currentTop : undefined
                  const fallbackHeight = Math.max(220, (questionCount * 220) + 40)
                  const blockHeightPx = Math.max(220, measuredHeight ?? fallbackHeight)

                  return (
                    <section
                      key={`${passage.slice(0, 24)}-${index}`}
                      className="relative"
                      style={{ minHeight: `${blockHeightPx}px` }}
                    >
                      <div className="sticky top-2 rounded-[10px] border border-[color:var(--accent-line)] bg-[color:var(--input-bg)] p-2">
                        <p className="font-['IBM_Plex_Mono'] text-[0.62rem] uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
                          {language === 'pt'
                            ? `Bloco ${index + 1} de ${examPassageHistory.length}`
                            : `Set ${index + 1} of ${examPassageHistory.length}`}
                        </p>
                        <div className="mt-1 text-sm leading-6 text-[color:var(--text-soft)]">
                          <ReactMarkdown components={markdownComponents}>{passage}</ReactMarkdown>
                        </div>
                      </div>
                    </section>
                  )
                })}
              </div>
            </div>
          </aside>
        ) : null}

        <div className={[
          'min-h-0 flex flex-col',
          showStickyPassagePanel ? 'flex-1 lg:min-w-0' : 'flex-1',
        ].join(' ')}>
          <div className={[
            'flex min-h-0 flex-1 flex-col gap-3',
            showStickyPassagePanel ? 'items-start' : 'items-center',
          ].join(' ')}>
            {visibleMessages.map((message) => {
              const retryCandidate = getRetryCandidate(message)
              const showRetryOption = activeConversation?.mode !== 'exam'
                ? Boolean(retryCandidate)
                : Boolean(message.retryAction)
                  || (isExamQuestionMessage(message) && !isExamQuestionAnswered(message))
                  || isLikelyInvalidExamPayload(message)
              const isRetryDisabled = !showRetryOption
                || !retryCandidate
                || isLoading
                || (retryCandidate.retryAt ? retryCandidate.retryAt > nowMs : false)
              const retryLabel = activeConversation?.mode === 'exam'
                ? (language === 'pt' ? 'Gerar novamente pergunta' : 'Regenerate question')
                : (language === 'pt' ? 'Gerar novamente resposta' : 'Regenerate answer')

              return (
              <div
                key={message.id}
                ref={(element) => {
                  const setIndex = messagePassageSetIndexById[message.id]
                  const isFirstMessageOfSet = typeof setIndex === 'number' && firstQuestionMessageBySet[setIndex] === message.id

                  if (isFirstMessageOfSet) {
                    firstQuestionRefs.current[setIndex] = element
                  }
                }}
                className={[
                  'flex w-full max-w-[700px]',
                  message.role === 'user' ? 'justify-end' : 'justify-start',
                ].join(' ')}
              >
                <article
                  className={[
                    'glass-card rounded-[10px] p-2',
                    message.role === 'user'
                      ? 'w-fit max-w-[84%] bg-[linear-gradient(180deg,rgba(31,59,138,0.42),rgba(13,24,64,0.24))] lg:max-w-[760px]'
                      : 'w-full',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-['IBM_Plex_Mono'] text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                      {message.role === 'assistant' ? 'Mentor AI' : language === 'pt' ? 'Voce' : 'You'}
                    </span>
                    {message.role === 'assistant' ? (
                      <div
                        ref={messageMenuOpenId === message.id ? messageMenuRef : undefined}
                        className="relative"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setMessageMenuOpenId((current) => (current === message.id ? null : message.id))
                          }}
                          aria-label={language === 'pt' ? 'Mais acoes da mensagem' : 'More message actions'}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] border border-[color:var(--card-border)] text-[color:var(--text-muted)] transition hover:text-[color:var(--text-main)]"
                        >
                          <EllipsisVertical size={14} />
                        </button>

                        {messageMenuOpenId === message.id ? (
                          <div className="absolute right-0 top-8 z-30 grid min-w-[170px] gap-1 rounded-[10px] border border-[color:var(--card-border)] bg-[color:var(--mobile-drawer-bg)] p-1 shadow-[0_14px_34px_rgba(6,10,22,0.28)]">
                            <button
                              type="button"
                              onClick={() => {
                                void copyMessageText(message.text)
                                setMessageMenuOpenId(null)
                              }}
                              className="rounded-[8px] px-2 py-1.5 text-left text-xs text-[color:var(--text-main)] transition hover:bg-[color:var(--input-bg)]"
                            >
                              {language === 'pt' ? 'Copiar mensagem' : 'Copy message'}
                            </button>
                            {showRetryOption ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (retryCandidate) {
                                    void retryAssistantMessage(retryCandidate)
                                  }
                                  setMessageMenuOpenId(null)
                                }}
                                disabled={isRetryDisabled}
                                className="rounded-[8px] px-2 py-1.5 text-left text-xs text-[color:var(--text-main)] transition hover:bg-[color:var(--input-bg)] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {retryLabel}
                              </button>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  {message.role === 'assistant' ? (
                    message.quiz ? (
                      <div className="mt-2 rounded-[10px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] p-2">
                        {message.quiz.topic ? (
                          <p className="font-['IBM_Plex_Mono'] text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--accent-soft)]">
                            {message.quiz.topic}
                          </p>
                        ) : null}
                        <div className="mt-1 text-sm font-medium leading-6 text-[color:var(--text-main)]">
                          <ReactMarkdown components={markdownComponents}>{message.quiz.question}</ReactMarkdown>
                        </div>
                        <div className="mt-2 grid gap-2">
                          {message.quiz.options.map((option) => {
                            const isSelected = message.selectedOptionId === option.id
                            const isAnswered = Boolean(message.selectedOptionId)
                            const isCorrect = option.id === message.quiz?.correctOptionId

                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => selectQuizOption(message.id, option.id)}
                                disabled={isAnswered}
                                className={[
                                  'rounded-[10px] border px-2 py-2 text-left text-sm transition',
                                  isAnswered && isCorrect ? 'border-emerald-400/60 bg-emerald-500/10 text-[color:var(--text-main)]' : '',
                                  isAnswered && isSelected && !isCorrect ? 'border-rose-400/60 bg-rose-500/10 text-[color:var(--text-main)]' : '',
                                  !isAnswered ? 'border-[color:var(--card-border)] bg-transparent hover:-translate-y-0.5' : '',
                                  isAnswered && !isSelected && !isCorrect ? 'border-[color:var(--card-border)] opacity-75' : '',
                                ].join(' ')}
                              >
                                <span className="mr-2 font-['IBM_Plex_Mono'] text-[0.72rem] uppercase tracking-[0.12em] text-[color:var(--accent-soft)]">{option.id}</span>
                                <span className="whitespace-pre-wrap break-words">{option.text}</span>
                              </button>
                            )
                          })}
                        </div>
                        {message.selectedOptionId ? (
                          <div className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">
                            {message.selectedOptionId === message.quiz.correctOptionId
                              ? (language === 'pt' ? 'Correto. ' : 'Correct. ')
                              : (language === 'pt' ? 'Resposta incorreta. ' : 'Incorrect answer. ')}
                            <ReactMarkdown components={markdownInlineComponents}>{message.quiz.explanation}</ReactMarkdown>
                          </div>
                        ) : null}
                      </div>
                    ) : message.trueFalse ? (
                      <div className="mt-2 rounded-[10px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] p-2">
                        {message.trueFalse.topic ? (
                          <p className="font-['IBM_Plex_Mono'] text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--accent-soft)]">
                            {message.trueFalse.topic}
                          </p>
                        ) : null}
                        <div className="mt-1 text-sm font-medium leading-6 text-[color:var(--text-main)]">
                          <ReactMarkdown components={markdownComponents}>{message.trueFalse.statement}</ReactMarkdown>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {[true, false].map((value) => {
                            const label = value ? (language === 'pt' ? 'Verdadeiro' : 'True') : (language === 'pt' ? 'Falso' : 'False')
                            const isSelected = message.selectedTrueFalse === value
                            const isAnswered = typeof message.selectedTrueFalse === 'boolean'
                            const isCorrect = value === message.trueFalse?.correctAnswer

                            return (
                              <button
                                key={String(value)}
                                type="button"
                                onClick={() => selectTrueFalseOption(message.id, value)}
                                disabled={isAnswered}
                                className={[
                                  'rounded-[10px] border px-2 py-2 text-sm transition',
                                  isAnswered && isCorrect ? 'border-emerald-400/60 bg-emerald-500/10 text-[color:var(--text-main)]' : '',
                                  isAnswered && isSelected && !isCorrect ? 'border-rose-400/60 bg-rose-500/10 text-[color:var(--text-main)]' : '',
                                  !isAnswered ? 'border-[color:var(--card-border)] hover:-translate-y-0.5' : '',
                                ].join(' ')}
                              >
                                {label}
                              </button>
                            )
                          })}
                        </div>
                        {typeof message.selectedTrueFalse === 'boolean' ? (
                          <div className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">
                            {message.selectedTrueFalse === message.trueFalse.correctAnswer
                              ? (language === 'pt' ? 'Correto. ' : 'Correct. ')
                              : (language === 'pt' ? 'Resposta incorreta. ' : 'Incorrect answer. ')}
                            <ReactMarkdown components={markdownInlineComponents}>{message.trueFalse.explanation}</ReactMarkdown>
                          </div>
                        ) : null}
                      </div>
                    ) : message.shortAnswer ? (
                      <div className="mt-2 rounded-[10px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] p-2">
                        {message.shortAnswer.topic ? (
                          <p className="font-['IBM_Plex_Mono'] text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--accent-soft)]">
                            {message.shortAnswer.topic}
                          </p>
                        ) : null}
                        <div className="mt-1 text-sm font-medium leading-6 text-[color:var(--text-main)]">
                          <ReactMarkdown components={markdownComponents}>{message.shortAnswer.question}</ReactMarkdown>
                        </div>
                        <div className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">
                          {language === 'pt' ? 'Resposta modelo:' : 'Sample answer:'} {message.shortAnswer.sampleAnswer}
                        </div>
                        {message.shortAnswer.evaluationCriteria.length > 0 ? (
                          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[color:var(--text-soft)]">
                            {message.shortAnswer.evaluationCriteria.map((criterion) => (
                              <li key={criterion}>
                                <ReactMarkdown components={markdownInlineComponents}>{criterion}</ReactMarkdown>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                        {activeConversation?.mode === 'exam' ? (
                          <button
                            type="button"
                            onClick={() => void generateExamQuestion(activeConversation.id, activeConversation.questionCount + 1)}
                            disabled={isLoading}
                            className="mt-2 rounded-full border border-[color:var(--card-border)] px-3 py-2 text-xs text-[color:var(--text-main)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {language === 'pt' ? 'Proxima questao' : 'Next question'}
                          </button>
                        ) : null}
                      </div>
                    ) : message.ordering ? (
                      <div className="mt-2 rounded-[10px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] p-2">
                        {message.ordering.topic ? (
                          <p className="font-['IBM_Plex_Mono'] text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--accent-soft)]">
                            {message.ordering.topic}
                          </p>
                        ) : null}
                        <div className="mt-1 text-sm font-medium leading-6 text-[color:var(--text-main)]">
                          <ReactMarkdown components={markdownComponents}>{message.ordering.question}</ReactMarkdown>
                        </div>
                        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-[color:var(--text-soft)]">
                          {(orderingDrafts[message.id] ?? message.ordering.items).map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ol>
                        {!message.orderingSubmitted ? (
                          <div className="mt-2 grid gap-2">
                            {(orderingDrafts[message.id] ?? message.ordering.items).map((selectedItem, index, currentItems) => (
                              <div key={`${selectedItem}-${index}`} className="grid grid-cols-[36px_minmax(0,1fr)] items-center gap-2">
                                <span className="text-xs font-semibold text-[color:var(--text-muted)]">{index + 1}</span>
                                <select
                                  value={selectedItem}
                                  onChange={(event) => {
                                    updateOrderingSelection(message.id, currentItems, index, event.target.value)
                                  }}
                                  className="rounded-[10px] border border-[color:var(--card-border)] bg-transparent px-2 py-2 text-sm text-[color:var(--text-main)]"
                                >
                                  {(message.ordering?.items ?? []).map((option) => {
                                    const alreadyUsed = currentItems.includes(option) && option !== selectedItem
                                    return (
                                      <option key={`${message.id}-${index}-${option}`} value={option} disabled={alreadyUsed}>
                                        {option}
                                      </option>
                                    )
                                  })}
                                </select>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => submitOrderingAnswer(message.id, orderingDrafts[message.id] ?? message.ordering?.items ?? [])}
                              className="rounded-[10px] border border-[color:var(--card-border)] px-3 py-2 text-xs text-[color:var(--text-main)]"
                            >
                              {language === 'pt' ? 'Responder ordenacao' : 'Submit ordering'}
                            </button>
                          </div>
                        ) : null}
                        {message.orderingSubmitted && message.ordering.explanation ? (
                          <div className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">
                            <ReactMarkdown components={markdownInlineComponents}>{message.ordering.explanation}</ReactMarkdown>
                          </div>
                        ) : null}
                      </div>
                    ) : message.matchPairs ? (
                      <div className="mt-2 rounded-[10px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] p-2">
                        {message.matchPairs.topic ? (
                          <p className="font-['IBM_Plex_Mono'] text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--accent-soft)]">
                            {message.matchPairs.topic}
                          </p>
                        ) : null}
                        {message.matchPairs.prompt ? (
                          <div className="mt-1 text-sm font-medium leading-6 text-[color:var(--text-main)]">
                            <ReactMarkdown components={markdownComponents}>{message.matchPairs.prompt}</ReactMarkdown>
                          </div>
                        ) : null}
                        <div className="mt-2 grid gap-2">
                          {(message.matchPairs?.pairs ?? []).map((pair) => {
                            const currentValue = matchDrafts[message.id]?.[pair.left] ?? ''
                            return (
                              <div key={`${pair.left}-${pair.right}`} className="grid grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] items-center gap-2 rounded-[10px] border border-[color:var(--card-border)] px-2 py-2 text-sm text-[color:var(--text-soft)]">
                                <span className="truncate font-medium text-[color:var(--text-main)]">{pair.left}</span>
                                <span className="h-px bg-[color:var(--card-border)]" />
                                {!message.matchPairsSubmitted ? (
                                  <select
                                    value={currentValue}
                                    onChange={(event) => {
                                      const nextValue = event.target.value
                                      setMatchDrafts((drafts) => ({
                                        ...drafts,
                                        [message.id]: {
                                          ...(drafts[message.id] ?? {}),
                                          [pair.left]: nextValue,
                                        },
                                      }))
                                    }}
                                    className="rounded-[10px] border border-[color:var(--card-border)] bg-transparent px-2 py-1 text-sm text-[color:var(--text-main)]"
                                  >
                                    <option value="">{language === 'pt' ? 'Selecione' : 'Select'}</option>
                                    {(message.matchPairs?.pairs ?? []).map((candidate) => {
                                      const usedByOther = Object.entries(matchDrafts[message.id] ?? {})
                                        .some(([leftKey, value]) => leftKey !== pair.left && value === candidate.right)

                                      return (
                                        <option
                                          key={`${pair.left}-${candidate.right}`}
                                          value={candidate.right}
                                          disabled={usedByOther && candidate.right !== currentValue}
                                        >
                                          {candidate.right}
                                        </option>
                                      )
                                    })}
                                  </select>
                                ) : (
                                  <span className="truncate">{message.matchPairsAnswer?.[pair.left] ?? '-'}</span>
                                )}
                              </div>
                            )
                          })}
                        </div>
                        {!message.matchPairsSubmitted ? (
                          <button
                            type="button"
                            onClick={() => submitMatchPairsAnswer(message.id, matchDrafts[message.id] ?? {})}
                            className="mt-2 rounded-[10px] border border-[color:var(--card-border)] px-3 py-2 text-xs text-[color:var(--text-main)]"
                          >
                            {language === 'pt' ? 'Responder associacao' : 'Submit matching'}
                          </button>
                        ) : null}
                        {message.matchPairsSubmitted && message.matchPairs.explanation ? (
                          <div className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">
                            <ReactMarkdown components={markdownInlineComponents}>{message.matchPairs.explanation}</ReactMarkdown>
                          </div>
                        ) : null}
                      </div>
                    ) : message.cloze ? (
                      <div className="mt-2 rounded-[10px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] p-2">
                        {message.cloze.topic ? (
                          <p className="font-['IBM_Plex_Mono'] text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--accent-soft)]">
                            {message.cloze.topic}
                          </p>
                        ) : null}
                        <div className="mt-1 text-sm leading-7 text-[color:var(--text-main)]">
                          {(() => {
                            const tokens = parseClozeTokens(message.cloze?.text ?? '')
                            const hasTokenizedBlanks = tokens.some((token) => token.type === 'blank')
                            const optionValues = (message.cloze?.blanks ?? []).map((blank) => blank.answer)

                            if (!hasTokenizedBlanks) {
                              return <ReactMarkdown components={markdownComponents}>{message.cloze?.text ?? ''}</ReactMarkdown>
                            }

                            return tokens.map((token, tokenIndex) => {
                              if (token.type === 'text') {
                                return <span key={`text-${tokenIndex}`}>{token.value}</span>
                              }

                              const blankId = token.value
                              const currentValue = clozeDrafts[message.id]?.[blankId] ?? ''

                              if (message.clozeSubmitted) {
                                return (
                                  <span key={`blank-${tokenIndex}`} className="mx-1 inline-flex rounded-[10px] border border-[color:var(--card-border)] px-2 py-0.5 text-xs text-[color:var(--text-main)]">
                                    {message.clozeAnswer?.[blankId] ?? '—'}
                                  </span>
                                )
                              }

                              return (
                                <select
                                  key={`blank-${tokenIndex}`}
                                  value={currentValue}
                                  onChange={(event) => {
                                    const nextValue = event.target.value
                                    setClozeDrafts((drafts) => ({
                                      ...drafts,
                                      [message.id]: {
                                        ...(drafts[message.id] ?? {}),
                                        [blankId]: nextValue,
                                      },
                                    }))
                                  }}
                                  className="mx-1 inline-flex rounded-[10px] border border-[color:var(--card-border)] bg-transparent px-2 py-1 text-xs text-[color:var(--text-main)]"
                                >
                                  <option value="">{language === 'pt' ? 'Selecione' : 'Select'}</option>
                                  {optionValues.map((option) => {
                                    const usedByOther = Object.entries(clozeDrafts[message.id] ?? {})
                                      .some(([id, value]) => id !== blankId && value === option)

                                    return (
                                      <option
                                        key={`${blankId}-${option}`}
                                        value={option}
                                        disabled={usedByOther && option !== currentValue}
                                      >
                                        {option}
                                      </option>
                                    )
                                  })}
                                </select>
                              )
                            })
                          })()}
                        </div>

                        {!parseClozeTokens(message.cloze?.text ?? '').some((token) => token.type === 'blank') ? (
                          <div className="mt-2 grid gap-2">
                            {(message.cloze?.blanks ?? []).map((blank) => (
                              <div key={blank.id} className="rounded-[10px] border border-[color:var(--card-border)] px-2 py-2 text-sm text-[color:var(--text-soft)]">
                                <span className="font-['IBM_Plex_Mono'] text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--accent-soft)]">{blank.id}</span>
                                <span className="mx-2 text-[color:var(--text-muted)]">=</span>
                                {!message.clozeSubmitted ? (
                                  <select
                                    value={clozeDrafts[message.id]?.[blank.id] ?? ''}
                                    onChange={(event) => {
                                      const nextValue = event.target.value
                                      setClozeDrafts((drafts) => ({
                                        ...drafts,
                                        [message.id]: {
                                          ...(drafts[message.id] ?? {}),
                                          [blank.id]: nextValue,
                                        },
                                      }))
                                    }}
                                    className="rounded-[10px] border border-[color:var(--card-border)] bg-transparent px-2 py-1 text-sm text-[color:var(--text-main)]"
                                  >
                                    <option value="">{language === 'pt' ? 'Selecione' : 'Select'}</option>
                                    {(message.cloze?.blanks ?? []).map((candidate) => {
                                      const currentValue = clozeDrafts[message.id]?.[blank.id] ?? ''
                                      const usedByOther = Object.entries(clozeDrafts[message.id] ?? {})
                                        .some(([id, value]) => id !== blank.id && value === candidate.answer)

                                      return (
                                        <option
                                          key={`${blank.id}-${candidate.answer}`}
                                          value={candidate.answer}
                                          disabled={usedByOther && candidate.answer !== currentValue}
                                        >
                                          {candidate.answer}
                                        </option>
                                      )
                                    })}
                                  </select>
                                ) : (
                                  <span>{message.clozeAnswer?.[blank.id] ?? '-'}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : null}
                        {!message.clozeSubmitted ? (
                          <button
                            type="button"
                            onClick={() => submitClozeAnswer(message.id, clozeDrafts[message.id] ?? {})}
                            className="mt-2 rounded-[10px] border border-[color:var(--card-border)] px-3 py-2 text-xs text-[color:var(--text-main)]"
                          >
                            {language === 'pt' ? 'Responder lacunas' : 'Submit cloze'}
                          </button>
                        ) : null}
                        {message.clozeSubmitted && message.cloze.explanation ? (
                          <div className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">
                            <ReactMarkdown components={markdownInlineComponents}>{message.cloze.explanation}</ReactMarkdown>
                          </div>
                        ) : null}
                      </div>
                    ) : message.id.startsWith('pending-') ? (
                      <div className="mt-2 space-y-2">
                        <div className="h-3 w-3/4 animate-pulse rounded-full bg-[color:var(--card-border)]" />
                        <div className="h-3 w-full animate-pulse rounded-full bg-[color:var(--card-border)]" />
                        <div className="h-3 w-2/3 animate-pulse rounded-full bg-[color:var(--card-border)]" />
                        <p className="pt-1 text-xs text-[color:var(--text-muted)]">{message.text}</p>
                      </div>
                    ) : (
                      <div className="mt-2 text-sm leading-7 text-[color:var(--text-soft)] sm:text-[0.97rem]">
                        <ReactMarkdown components={markdownComponents}>
                          {message.text}
                        </ReactMarkdown>
                      </div>
                    )
                  ) : (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[color:var(--text-soft)] sm:text-[0.97rem]">{message.text}</p>
                  )}
                </article>
              </div>
              )
            })}

            {isLoading && !hasPendingExamMessage ? (
              <div className="flex w-full max-w-[700px] justify-start">
                <article className="glass-card w-full rounded-[10px] p-2">
                  <span className="font-['IBM_Plex_Mono'] text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                    Mentor AI
                  </span>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[color:var(--text-soft)] sm:text-[0.97rem]">
                    {activeConversation?.mode === 'exam'
                      ? (language === 'pt' ? 'Gerando proxima questao...' : 'Generating next question...')
                      : (language === 'pt' ? 'Pensando na melhor resposta...' : 'Thinking about the best response...')}
                  </p>
                </article>
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className={[
            'mt-2 flex',
            showStickyPassagePanel ? 'justify-start' : 'justify-center',
          ].join(' ')}>
            <div className="glass-card w-full max-w-[700px] rounded-[10px] p-2 sm:p-2">
              <div className="flex items-end gap-2">
                <div ref={responseMenuRef} className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsResponseMenuOpen((current) => !current)}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-[10px] border border-[color:var(--input-border)] bg-[color:var(--input-bg)] text-[color:var(--text-main)] transition hover:bg-[color:var(--mobile-drawer-card-bg)]"
                    aria-label={language === 'pt' ? 'Tipo de resposta' : 'Response type'}
                    title={responseModeLabel[language][responseMode]}
                  >
                    {getResponseModeIcon(responseMode)}
                  </button>

                  {isResponseMenuOpen ? (
                    <div className="absolute bottom-full left-0 z-30 mb-2 w-[220px] rounded-[10px] border border-[color:var(--card-border)] bg-[color:var(--mobile-drawer-bg)] p-2 shadow-[0_14px_34px_rgba(6,10,22,0.28)]">
                      <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
                        {language === 'pt' ? 'Tipo de resposta' : 'Response type'}
                      </p>
                      <div className="grid gap-2">
                        {responseModeOptions.map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => {
                              setResponseMode(mode)
                              setIsResponseMenuOpen(false)
                            }}
                            className={[
                              'inline-flex items-center gap-2 rounded-[10px] border px-2 py-2 text-left text-sm',
                              responseMode === mode
                                ? 'border-[color:var(--accent-line)] bg-[color:var(--input-bg)] text-[color:var(--text-main)]'
                                : 'border-[color:var(--card-border)] text-[color:var(--text-soft)]',
                            ].join(' ')}
                          >
                            {getResponseModeIcon(mode)}
                            <span>{responseModeLabel[language][mode]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <textarea
                  ref={draftTextareaRef}
                  value={draft}
                  onChange={(event) => {
                    setDraft(event.target.value)
                    resizeDraftTextarea(event.target)
                  }}
                  rows={1}
                  disabled={isLoading}
                  placeholder={language === 'pt' ? 'Pergunte algo, peca um plano ou gere uma tarefa' : 'Ask something, request a plan, or generate a task'}
                  className="app-scroll min-h-12 min-w-0 flex-1 resize-none rounded-[10px] border border-[color:var(--input-border)] bg-[color:var(--input-bg)] px-2 py-2 leading-6 text-[color:var(--text-main)] outline-none transition placeholder:text-[color:var(--text-muted)] [&::placeholder]:overflow-hidden [&::placeholder]:text-ellipsis [&::placeholder]:whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-70 focus:border-[color:var(--accent-line)]"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  aria-label={language === 'pt' ? 'Enviar mensagem' : 'Send message'}
                  className="accent-button inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <ArrowUp size={16} />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
