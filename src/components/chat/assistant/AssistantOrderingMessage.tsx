import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import type { Message } from '../../../types/chat'

interface AssistantOrderingMessageProps {
  message: Message
  language: 'pt' | 'en'
  markdownComponents: Components
  markdownInlineComponents: Components
  orderingDrafts: Record<string, string[]>
  setOrderingDrafts: React.Dispatch<React.SetStateAction<Record<string, string[]>>>
  submitOrderingAnswer: (messageId: string, answer: string[]) => void
}

export function AssistantOrderingMessage({
  message,
  language,
  markdownComponents,
  markdownInlineComponents,
  orderingDrafts,
  setOrderingDrafts,
  submitOrderingAnswer,
}: AssistantOrderingMessageProps) {
  if (!message.ordering) {
    return null
  }

  const options = message.ordering.items
  const currentOrder = orderingDrafts[message.id] ?? Array.from({ length: options.length }, () => '')

  function updateOrderingSelection(position: number, nextItem: string) {
    const next = [...currentOrder]
    const previousIndex = next.findIndex((item) => item === nextItem)

    if (previousIndex >= 0) {
      const currentAtPosition = next[position]
      next[previousIndex] = currentAtPosition
    }

    next[position] = nextItem
    setOrderingDrafts((drafts) => ({ ...drafts, [message.id]: next }))
  }

  return (
    <div className="mt-2 rounded-[10px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] p-2">
      {message.ordering.topic ? (
        <p className="font-['IBM_Plex_Mono'] text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--accent-soft)]">
          {message.ordering.topic}
        </p>
      ) : null}
      <div className="mt-1 text-sm font-medium leading-6 text-[color:var(--text-main)]">
        <ReactMarkdown components={markdownComponents}>{message.ordering.question}</ReactMarkdown>
      </div>
      <div className="mt-2 grid gap-2">
        {currentOrder.map((selectedValue, index) => (
          <div key={`${message.id}-order-${index}`} className="rounded-[10px] border border-[color:var(--card-border)] px-2 py-2 text-sm text-[color:var(--text-soft)]">
            <span className="mr-2 font-['IBM_Plex_Mono'] text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--accent-soft)]">{index + 1}</span>
            {!message.orderingSubmitted ? (
              <select
                value={selectedValue}
                onChange={(event) => updateOrderingSelection(index, event.target.value)}
                className="rounded-[10px] border border-[color:var(--card-border)] bg-transparent px-2 py-1 text-sm text-[color:var(--text-main)]"
              >
                <option value="">{language === 'pt' ? 'Selecione' : 'Select'}</option>
                {options.map((option) => {
                  const usedByOther = currentOrder.some((entry, entryIndex) => entryIndex !== index && entry === option)

                  return (
                    <option
                      key={`${message.id}-${option}`}
                      value={option}
                      disabled={usedByOther && option !== selectedValue}
                    >
                      {option}
                    </option>
                  )
                })}
              </select>
            ) : (
              <span>{message.orderingAnswer?.[index] ?? '-'}</span>
            )}
          </div>
        ))}
      </div>
      {!message.orderingSubmitted ? (
        <button
          type="button"
          onClick={() => submitOrderingAnswer(message.id, currentOrder)}
          className="mt-2 rounded-[10px] border border-[color:var(--card-border)] px-3 py-2 text-xs text-[color:var(--text-main)]"
        >
          {language === 'pt' ? 'Responder ordenacao' : 'Submit ordering'}
        </button>
      ) : null}
      {message.orderingSubmitted && message.ordering.explanation ? (
        <div className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">
          <ReactMarkdown components={markdownInlineComponents}>{message.ordering.explanation}</ReactMarkdown>
        </div>
      ) : null}
    </div>
  )
}
