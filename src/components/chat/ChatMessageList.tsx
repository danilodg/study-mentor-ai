import ReactMarkdown from 'react-markdown'
import { ArrowUp } from 'lucide-react'
import { useChatWorkspaceContext } from '../../context/ChatWorkspaceContext'

export function ChatMessageList() {
  const {
    language,
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
    isLoading,
    draft,
    setDraft,
    resizeDraftTextarea,
    draftTextareaRef,
    handleSubmit,
  } = useChatWorkspaceContext()

  return (
    <div className="mt-2 min-h-0 flex-1 overflow-hidden sm:mt-3 lg:mt-4">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-[980px] flex-col overflow-hidden lg:flex-row lg:gap-2">
        {showStickyPassagePanel ? (
          <aside className="glass-card hidden w-[350px] shrink-0 overflow-hidden rounded-[10px] border border-[color:var(--card-border)] bg-transparent p-2 lg:flex lg:flex-col">
            <p className="font-['IBM_Plex_Mono'] text-[0.66rem] uppercase tracking-[0.14em] text-[color:var(--accent-soft)]">
              {language === 'pt' ? 'Texto-base' : 'Base passage'}
            </p>
            <div className="app-scroll mt-2 flex-1 overflow-y-auto text-sm leading-6 text-[color:var(--text-soft)]">
              <ReactMarkdown components={markdownComponents}>{examPassage ?? ''}</ReactMarkdown>
            </div>
          </aside>
        ) : null}

        <div className={[
          'min-h-0 flex flex-col overflow-hidden',
          showStickyPassagePanel ? 'flex-1 lg:min-w-0' : 'flex-1',
        ].join(' ')}>
          <div className={[
            'app-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto',
            showStickyPassagePanel ? 'items-start' : 'items-center',
          ].join(' ')}>
            {visibleMessages.map((message) => (
              <div
                key={message.id}
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
                  <span className="font-['IBM_Plex_Mono'] text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                    {message.role === 'assistant' ? 'Mentor AI' : language === 'pt' ? 'Voce' : 'You'}
                  </span>
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

                  {message.retryAction ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void retryAssistantMessage(message)}
                        disabled={isLoading || (message.retryAt ? message.retryAt > nowMs : false)}
                        className="rounded-full border border-[color:var(--card-border)] bg-transparent px-3 py-1.5 text-xs font-medium text-[color:var(--text-main)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {language === 'pt' ? 'Tentar novamente' : 'Try again'}
                      </button>
                      {message.retryAt && message.retryAt > nowMs ? (
                        <span className="font-['IBM_Plex_Mono'] text-[0.64rem] uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
                          {language === 'pt'
                            ? `Disponivel em ${Math.ceil((message.retryAt - nowMs) / 1000)}s`
                            : `Available in ${Math.ceil((message.retryAt - nowMs) / 1000)}s`}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              </div>
            ))}

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
