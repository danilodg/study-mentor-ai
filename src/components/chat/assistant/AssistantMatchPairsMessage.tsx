import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import type { Message } from '../../../types/chat'

interface AssistantMatchPairsMessageProps {
  message: Message
  language: 'pt' | 'en'
  markdownComponents: Components
  markdownInlineComponents: Components
  matchDrafts: Record<string, Record<string, string>>
  setMatchDrafts: React.Dispatch<React.SetStateAction<Record<string, Record<string, string>>>>
  submitMatchPairsAnswer: (messageId: string, answer: Record<string, string>) => void
}

export function AssistantMatchPairsMessage({
  message,
  language,
  markdownComponents,
  markdownInlineComponents,
  matchDrafts,
  setMatchDrafts,
  submitMatchPairsAnswer,
}: AssistantMatchPairsMessageProps) {
  if (!message.matchPairs) {
    return null
  }

  return (
    <div className="mt-2 rounded-[10px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] p-2">
      {message.matchPairs.topic ? (
        <p className="font-['IBM_Plex_Mono'] text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--accent-soft)]">
          {message.matchPairs.topic}
        </p>
      ) : null}
      <div className="mt-1 text-sm font-medium leading-6 text-[color:var(--text-main)]">
        <ReactMarkdown components={markdownComponents}>{message.matchPairs.prompt}</ReactMarkdown>
      </div>
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
  )
}
