import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import type { Message } from '../../../types/chat'

interface AssistantClozeMessageProps {
  message: Message
  language: 'pt' | 'en'
  markdownComponents: Components
  markdownInlineComponents: Components
  clozeDrafts: Record<string, Record<string, string>>
  setClozeDrafts: React.Dispatch<React.SetStateAction<Record<string, Record<string, string>>>>
  submitClozeAnswer: (messageId: string, answer: Record<string, string>) => void
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

export function AssistantClozeMessage({
  message,
  language,
  markdownComponents,
  markdownInlineComponents,
  clozeDrafts,
  setClozeDrafts,
  submitClozeAnswer,
}: AssistantClozeMessageProps) {
  if (!message.cloze) {
    return null
  }

  return (
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
          const allBlanks = message.cloze?.blanks ?? []
          const optionValues = Array.from(new Set(allBlanks.map((blank) => blank.answer)))

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
                className="mx-1 inline-flex min-w-[108px] rounded-[10px] border border-[color:var(--card-border)] bg-transparent px-2 py-1 text-xs text-[color:var(--text-main)]"
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
  )
}
