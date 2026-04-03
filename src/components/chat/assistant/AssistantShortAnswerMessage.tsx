import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import type { Conversation, Message } from '../../../types/chat'

interface AssistantShortAnswerMessageProps {
  message: Message
  language: 'pt' | 'en'
  markdownComponents: Components
  markdownInlineComponents: Components
  activeConversation?: Conversation
  generateExamQuestion: (conversationId: string, nextQuestionNumber: number) => Promise<void>
  isLoading: boolean
}

export function AssistantShortAnswerMessage({
  message,
  language,
  markdownComponents,
  markdownInlineComponents,
  activeConversation,
  generateExamQuestion,
  isLoading,
}: AssistantShortAnswerMessageProps) {
  if (!message.shortAnswer) {
    return null
  }

  return (
    <div className="mt-2 rounded-[10px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] p-2">
      {message.shortAnswer.topic ? (
        <p className="font-['IBM_Plex_Mono'] text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--accent-soft)]">
          {message.shortAnswer.topic}
        </p>
      ) : null}
      <div className="mt-1 text-sm font-medium leading-6 text-[color:var(--text-main)]">
        <ReactMarkdown components={markdownComponents}>{message.shortAnswer.question}</ReactMarkdown>
      </div>
      <div className="mt-2 rounded-[10px] border border-[color:var(--card-border)] p-2 text-sm leading-6 text-[color:var(--text-soft)]">
        <span className="font-semibold text-[color:var(--text-main)]">{language === 'pt' ? 'Resposta modelo:' : 'Sample answer:'}</span>{' '}
        <ReactMarkdown components={markdownInlineComponents}>{message.shortAnswer.sampleAnswer}</ReactMarkdown>
        {message.shortAnswer.evaluationCriteria.length ? (
          <ul className="mt-1 list-disc space-y-1 pl-4">
            {message.shortAnswer.evaluationCriteria.map((criterion) => (
              <li key={`${message.id}-${criterion.slice(0, 16)}`}>
                <ReactMarkdown components={markdownInlineComponents}>{criterion}</ReactMarkdown>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
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
  )
}
