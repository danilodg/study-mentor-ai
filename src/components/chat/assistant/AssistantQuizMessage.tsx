import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import type { Message, QuizOptionId } from '../../../types/chat'

interface AssistantQuizMessageProps {
  message: Message
  language: 'pt' | 'en'
  markdownComponents: Components
  markdownInlineComponents: Components
  selectQuizOption: (messageId: string, optionId: QuizOptionId) => void
}

export function AssistantQuizMessage({
  message,
  language,
  markdownComponents,
  markdownInlineComponents,
  selectQuizOption,
}: AssistantQuizMessageProps) {
  const [draftOptionId, setDraftOptionId] = useState<QuizOptionId | null>(null)

  if (!message.quiz) {
    return null
  }

  const isAnswered = Boolean(message.selectedOptionId)

  useEffect(() => {
    if (isAnswered && message.selectedOptionId) {
      setDraftOptionId(message.selectedOptionId)
      return
    }

    setDraftOptionId(null)
  }, [isAnswered, message.id, message.selectedOptionId])

  return (
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
          const isSelected = isAnswered ? message.selectedOptionId === option.id : draftOptionId === option.id
          const isCorrect = option.id === message.quiz?.correctOptionId

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setDraftOptionId(option.id)}
              disabled={isAnswered}
              className={[
                'rounded-[10px] border px-2 py-2 text-left text-sm transition',
                isAnswered && isCorrect ? 'border-emerald-400/60 bg-emerald-500/10 text-[color:var(--text-main)]' : '',
                isAnswered && isSelected && !isCorrect ? 'border-rose-400/60 bg-rose-500/10 text-[color:var(--text-main)]' : '',
                !isAnswered && isSelected ? 'border-[color:var(--accent-soft)] bg-[color:var(--panel-bg)] text-[color:var(--text-main)]' : '',
                !isAnswered && !isSelected ? 'border-[color:var(--card-border)] bg-transparent hover:-translate-y-0.5' : '',
                isAnswered && !isSelected && !isCorrect ? 'border-[color:var(--card-border)] opacity-75' : '',
              ].join(' ')}
            >
              <span className="mr-2 font-['IBM_Plex_Mono'] text-[0.72rem] uppercase tracking-[0.12em] text-[color:var(--accent-soft)]">{option.id}</span>
              <span className="whitespace-pre-wrap break-words">{option.text}</span>
            </button>
          )
        })}
      </div>
      {!isAnswered ? (
        <button
          type="button"
          onClick={() => {
            if (!draftOptionId) {
              return
            }

            selectQuizOption(message.id, draftOptionId)
          }}
          disabled={!draftOptionId}
          className="mt-2 rounded-[10px] border border-[color:var(--card-border)] px-3 py-2 text-xs text-[color:var(--text-main)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {language === 'pt' ? 'Verificar resposta' : 'Check answer'}
        </button>
      ) : null}
      {message.selectedOptionId ? (
        <div className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">
          {message.selectedOptionId === message.quiz.correctOptionId
            ? (language === 'pt' ? 'Correto. ' : 'Correct. ')
            : (language === 'pt' ? 'Resposta incorreta. ' : 'Incorrect answer. ')}
          <ReactMarkdown components={markdownInlineComponents}>{message.quiz.explanation}</ReactMarkdown>
        </div>
      ) : null}
    </div>
  )
}
