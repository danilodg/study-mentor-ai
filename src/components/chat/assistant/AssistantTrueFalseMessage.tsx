import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import type { Message } from '../../../types/chat'

interface AssistantTrueFalseMessageProps {
  message: Message
  language: 'pt' | 'en'
  markdownComponents: Components
  markdownInlineComponents: Components
  selectTrueFalseOption: (messageId: string, answer: boolean) => void
}

export function AssistantTrueFalseMessage({
  message,
  language,
  markdownComponents,
  markdownInlineComponents,
  selectTrueFalseOption,
}: AssistantTrueFalseMessageProps) {
  if (!message.trueFalse) {
    return null
  }

  return (
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
  )
}
