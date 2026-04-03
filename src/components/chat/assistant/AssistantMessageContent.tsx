import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import type { Conversation, Message, QuizOptionId, ResponseMode } from '../../../types/chat'
import { AssistantClozeMessage } from './AssistantClozeMessage'
import { AssistantMatchPairsMessage } from './AssistantMatchPairsMessage'
import { AssistantOrderingMessage } from './AssistantOrderingMessage'
import { AssistantQuizMessage } from './AssistantQuizMessage'
import { AssistantShortAnswerMessage } from './AssistantShortAnswerMessage'
import { AssistantSkeleton } from './AssistantSkeleton'
import { AssistantTrueFalseMessage } from './AssistantTrueFalseMessage'

interface AssistantMessageContentProps {
  message: Message
  language: 'pt' | 'en'
  markdownComponents: Components
  markdownInlineComponents: Components
  loadingSkeletonMode: ResponseMode | 'exam'
  orderingDrafts: Record<string, string[]>
  matchDrafts: Record<string, Record<string, string>>
  clozeDrafts: Record<string, Record<string, string>>
  setOrderingDrafts: React.Dispatch<React.SetStateAction<Record<string, string[]>>>
  setMatchDrafts: React.Dispatch<React.SetStateAction<Record<string, Record<string, string>>>>
  setClozeDrafts: React.Dispatch<React.SetStateAction<Record<string, Record<string, string>>>>
  selectQuizOption: (messageId: string, optionId: QuizOptionId) => void
  selectTrueFalseOption: (messageId: string, answer: boolean) => void
  submitOrderingAnswer: (messageId: string, answer: string[]) => void
  submitMatchPairsAnswer: (messageId: string, answer: Record<string, string>) => void
  submitClozeAnswer: (messageId: string, answer: Record<string, string>) => void
  activeConversation?: Conversation
  generateExamQuestion: (conversationId: string, nextQuestionNumber: number) => Promise<void>
  isLoading: boolean
}

export function AssistantMessageContent({
  message,
  language,
  markdownComponents,
  markdownInlineComponents,
  loadingSkeletonMode,
  orderingDrafts,
  matchDrafts,
  clozeDrafts,
  setOrderingDrafts,
  setMatchDrafts,
  setClozeDrafts,
  selectQuizOption,
  selectTrueFalseOption,
  submitOrderingAnswer,
  submitMatchPairsAnswer,
  submitClozeAnswer,
  activeConversation,
  generateExamQuestion,
  isLoading,
}: AssistantMessageContentProps) {
  if (message.quiz) {
    return (
      <AssistantQuizMessage
        message={message}
        language={language}
        markdownComponents={markdownComponents}
        markdownInlineComponents={markdownInlineComponents}
        selectQuizOption={selectQuizOption}
      />
    )
  }

  if (message.trueFalse) {
    return (
      <AssistantTrueFalseMessage
        message={message}
        language={language}
        markdownComponents={markdownComponents}
        markdownInlineComponents={markdownInlineComponents}
        selectTrueFalseOption={selectTrueFalseOption}
      />
    )
  }

  if (message.shortAnswer) {
    return (
      <AssistantShortAnswerMessage
        message={message}
        language={language}
        markdownComponents={markdownComponents}
        markdownInlineComponents={markdownInlineComponents}
        activeConversation={activeConversation}
        generateExamQuestion={generateExamQuestion}
        isLoading={isLoading}
      />
    )
  }

  if (message.ordering) {
    return (
      <AssistantOrderingMessage
        message={message}
        language={language}
        markdownComponents={markdownComponents}
        markdownInlineComponents={markdownInlineComponents}
        orderingDrafts={orderingDrafts}
        setOrderingDrafts={setOrderingDrafts}
        submitOrderingAnswer={submitOrderingAnswer}
      />
    )
  }

  if (message.matchPairs) {
    return (
      <AssistantMatchPairsMessage
        message={message}
        language={language}
        markdownComponents={markdownComponents}
        markdownInlineComponents={markdownInlineComponents}
        matchDrafts={matchDrafts}
        setMatchDrafts={setMatchDrafts}
        submitMatchPairsAnswer={submitMatchPairsAnswer}
      />
    )
  }

  if (message.cloze) {
    return (
      <AssistantClozeMessage
        message={message}
        language={language}
        markdownComponents={markdownComponents}
        markdownInlineComponents={markdownInlineComponents}
        clozeDrafts={clozeDrafts}
        setClozeDrafts={setClozeDrafts}
        submitClozeAnswer={submitClozeAnswer}
      />
    )
  }

  if (message.id.startsWith('pending-') && !message.retryAction) {
    return (
      <div className="space-y-2">
        <AssistantSkeleton mode={loadingSkeletonMode} />
        <p className="pt-1 text-xs text-[color:var(--text-muted)]">{message.text}</p>
      </div>
    )
  }

  return (
    <div className="mt-2 text-sm leading-7 text-[color:var(--text-soft)] sm:text-[0.97rem]">
      <ReactMarkdown components={markdownComponents}>
        {message.text}
      </ReactMarkdown>
    </div>
  )
}
