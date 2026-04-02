import type {
  AssistantReplyPayload,
  AssistantStructuredResponse,
  Conversation,
  Message,
  ResponseMode,
  StoredChatState,
  QuizActivity,
  QuizOption,
  QuizOptionId,
  OrderingActivity,
  MatchPairsActivity,
  ClozeActivity,
  ShortAnswerActivity,
  TrueFalseActivity,
} from '../types/chat'

export function parseStoredResponseMode(value: unknown): ResponseMode {
  return value === 'quiz_mcq'
    || value === 'true_false'
    || value === 'short_answer'
    || value === 'ordering'
    || value === 'match_pairs'
    || value === 'cloze'
    || value === 'auto'
    ? value
    : 'auto'
}

function cleanAssistantReply(text: string) {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim()
}

function normalizeJsonText(text: string) {
  return text
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/,\s*([}\]])/g, '$1')
    .trim()
}

export function parseRetryDelayMs(errorMessage: string) {
  const match = errorMessage.match(/(?:please\s+retry\s+in|retry\s+in|try\s+again\s+in|retrydelay[":=\s]*)([\d.]+)\s*(?:s|sec|seconds)?/i)

  if (!match) {
    return 0
  }

  const seconds = Number.parseFloat(match[1] ?? '')

  if (!Number.isFinite(seconds) || seconds <= 0) {
    return 0
  }

  return Math.ceil(seconds * 1000)
}

export function parseQuizOptionId(value: string | undefined): QuizOptionId | null {
  const normalized = value?.trim().toUpperCase()

  if (normalized === 'A' || normalized === 'B' || normalized === 'C' || normalized === 'D') {
    return normalized
  }

  return null
}

export function getQuestionOnlyHistory(conversation: Conversation, limit = 8) {
  const extractedQuestions = conversation.messages
    .filter((message) => message.role === 'assistant')
    .map((message) => {
      if (message.quiz?.question) {
        return message.quiz.question
      }

      if (message.trueFalse?.statement) {
        return message.trueFalse.statement
      }

      if (message.shortAnswer?.question) {
        return message.shortAnswer.question
      }

      if (message.ordering?.question) {
        return message.ordering.question
      }

      if (message.matchPairs?.prompt) {
        return message.matchPairs.prompt
      }

      if (message.cloze?.text) {
        return message.cloze.text
      }

      return ''
    })
    .map((question) => question.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  return extractedQuestions
    .slice(-limit)
    .map((question) => (question.length > 220 ? `${question.slice(0, 220).trim()}...` : question))
}

export function parseAssistantReply(rawText: string): AssistantReplyPayload {
  const cleanedText = cleanAssistantReply(rawText)

  try {
    const parsed = JSON.parse(normalizeJsonText(cleanedText)) as AssistantStructuredResponse

      if (parsed.type === 'quiz_mcq') {
      const correctOptionId = parseQuizOptionId(parsed.correctOptionId)
      const options = (parsed.options ?? [])
        .map((option) => {
          const optionId = parseQuizOptionId(option.id)

          if (!optionId || typeof option.text !== 'string' || !option.text.trim()) {
            return null
          }

          return {
            id: optionId,
            text: option.text.trim().replace(/\s+/g, ' '),
          } satisfies QuizOption
        })
        .filter((option): option is QuizOption => option !== null)

      if (correctOptionId && options.length >= 2 && parsed.question?.trim()) {
        const quiz: QuizActivity = {
          id: parsed.id?.trim() || `quiz-${Date.now()}`,
          topic: parsed.topic?.trim() || '',
          question: parsed.question.trim(),
          options,
          correctOptionId,
          explanation: parsed.explanation?.trim() || '',
        }

        return {
          responseType: 'quiz_mcq',
          text: quiz.question,
          quiz,
        }
      }
    }

    if (parsed.type === 'ordering' && parsed.question?.trim()) {
      const items = (parsed.items ?? []).map((item) => item.trim()).filter(Boolean)
      const correctOrder = (parsed.correctOrder ?? []).map((item) => item.trim()).filter(Boolean)

      if (items.length >= 2) {
        const ordering: OrderingActivity = {
          id: parsed.id?.trim() || `ordering-${Date.now()}`,
          topic: parsed.topic?.trim() || '',
          question: parsed.question.trim(),
          items,
          correctOrder,
          explanation: parsed.explanation?.trim() || '',
        }

        return {
          responseType: 'ordering',
          text: ordering.question,
          ordering,
        }
      }
    }

    if (parsed.type === 'match_pairs') {
      const pairs = (parsed.pairs ?? [])
        .map((pair) => {
          const left = pair.left?.trim() || ''
          const right = pair.right?.trim() || ''

          if (!left || !right) {
            return null
          }

          return { left, right }
        })
        .filter((pair): pair is { left: string; right: string } => pair !== null)

      if (pairs.length >= 2) {
        const matchPairs: MatchPairsActivity = {
          id: parsed.id?.trim() || `match-pairs-${Date.now()}`,
          topic: parsed.topic?.trim() || '',
          prompt: parsed.prompt?.trim() || parsed.question?.trim() || '',
          pairs,
          explanation: parsed.explanation?.trim() || '',
        }

        return {
          responseType: 'match_pairs',
          text: matchPairs.prompt || (matchPairs.topic || 'Match pairs activity'),
          matchPairs,
        }
      }
    }

    if (parsed.type === 'cloze' && parsed.text?.trim()) {
      const blanks = (parsed.blanks ?? [])
        .map((blank, index) => {
          const answer = blank.answer?.trim() || ''
          if (!answer) {
            return null
          }

          return {
            id: blank.id?.trim() || `blank-${index + 1}`,
            answer,
          }
        })
        .filter((blank): blank is { id: string; answer: string } => blank !== null)

      if (blanks.length > 0) {
        const cloze: ClozeActivity = {
          id: parsed.id?.trim() || `cloze-${Date.now()}`,
          topic: parsed.topic?.trim() || '',
          text: parsed.text.trim(),
          blanks,
          explanation: parsed.explanation?.trim() || '',
        }

        return {
          responseType: 'cloze',
          text: cloze.text,
          cloze,
        }
      }
    }

    if (parsed.type === 'true_false' && parsed.statement?.trim() && typeof parsed.correctAnswer === 'boolean') {
      const trueFalse: TrueFalseActivity = {
        id: parsed.id?.trim() || `true-false-${Date.now()}`,
        topic: parsed.topic?.trim() || '',
        statement: parsed.statement.trim(),
        correctAnswer: parsed.correctAnswer,
        explanation: parsed.explanation?.trim() || '',
      }

      return {
        responseType: 'true_false',
        text: trueFalse.statement,
        trueFalse,
      }
    }

    if (parsed.type === 'short_answer' && parsed.question?.trim()) {
      const shortAnswer: ShortAnswerActivity = {
        id: parsed.id?.trim() || `short-answer-${Date.now()}`,
        topic: parsed.topic?.trim() || '',
        question: parsed.question.trim(),
        sampleAnswer: parsed.sampleAnswer?.trim() || '',
        evaluationCriteria: (parsed.evaluationCriteria ?? [])
          .map((criterion) => criterion.trim())
          .filter(Boolean),
      }

      return {
        responseType: 'short_answer',
        text: shortAnswer.question,
        shortAnswer,
      }
    }

    if (parsed.type === 'text' && typeof parsed.text === 'string' && parsed.text.trim()) {
      return {
        responseType: 'text',
        text: cleanAssistantReply(parsed.text),
      }
    }
  } catch {
    return {
      responseType: 'text',
      text: cleanAssistantReply(rawText),
    }
  }

  return {
    responseType: 'text',
    text: cleanAssistantReply(rawText),
  }
}

type ConversationOverrides = Partial<Pick<Conversation, 'mode' | 'topic' | 'difficulty' | 'title' | 'examProfile' | 'examFlow' | 'examPassage' | 'examQuestionTarget'>>

export function createConversation(overrides?: ConversationOverrides) {
  const now = Date.now()

  return {
    id: `c-${now}-${Math.random().toString(36).slice(2, 8)}`,
    title: overrides?.title ?? '',
    messages: [],
    mode: overrides?.mode ?? 'chat',
    topic: overrides?.topic ?? '',
    difficulty: overrides?.difficulty ?? 'auto',
    examProfile: overrides?.examProfile ?? 'general',
    examFlow: overrides?.examFlow ?? 'single',
    examPassage: overrides?.examPassage ?? '',
    examQuestionTarget: overrides?.examQuestionTarget ?? 0,
    questionCount: 0,
    createdAt: now,
    updatedAt: now,
  } satisfies Conversation
}

export function getStoredChatState(chatStorageKey: string) {
  if (typeof window === 'undefined') {
    return null
  }

  const rawState = window.localStorage.getItem(chatStorageKey)

  if (!rawState) {
    return null
  }

  try {
    const parsed = JSON.parse(rawState) as StoredChatState

    if (Array.isArray(parsed.conversations) && parsed.conversations.length > 0) {
      const normalizedConversations: Conversation[] = parsed.conversations.map((conversation) => ({
        id: conversation.id,
        title: conversation.title,
        messages: conversation.messages,
        mode: conversation.mode === 'exam' ? 'exam' : 'chat',
        topic: typeof conversation.topic === 'string' ? conversation.topic : '',
        difficulty: conversation.difficulty === 'easy' || conversation.difficulty === 'medium' || conversation.difficulty === 'hard' || conversation.difficulty === 'auto'
          ? conversation.difficulty
          : 'auto',
        examProfile: conversation.examProfile === 'enem' ? 'enem' : 'general',
        examFlow: conversation.examFlow === 'passage' ? 'passage' : 'single',
        examPassage: typeof conversation.examPassage === 'string' ? conversation.examPassage : '',
        examQuestionTarget: typeof conversation.examQuestionTarget === 'number' ? conversation.examQuestionTarget : 0,
        questionCount: typeof conversation.questionCount === 'number' ? conversation.questionCount : 0,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      }))

      const safeActiveConversationId = normalizedConversations.some((conversation) => conversation.id === parsed.activeConversationId)
        ? parsed.activeConversationId
        : normalizedConversations[0].id

      return {
        conversations: normalizedConversations,
        activeConversationId: safeActiveConversationId,
        language: parsed.language === 'en' ? 'en' : 'pt',
        responseMode: parseStoredResponseMode(parsed.responseMode),
      } satisfies StoredChatState
    }

    if (Array.isArray(parsed.messages)) {
      const migratedConversation = createConversation()

      return {
        conversations: [{
          ...migratedConversation,
          messages: parsed.messages,
          title: parsed.messages.find((message: Message) => message.role === 'user')?.text ?? '',
          mode: 'chat',
          topic: '',
          difficulty: 'auto',
          examProfile: 'general',
          examFlow: 'single',
          examPassage: '',
          examQuestionTarget: 0,
          questionCount: 0,
        }],
        activeConversationId: migratedConversation.id,
        language: parsed.language === 'en' ? 'en' : 'pt',
        responseMode: 'auto',
      } satisfies StoredChatState
    }

    return null
  } catch {
    return null
  }
}

export function getConversationTitle(text: string) {
  const normalized = text.trim().replace(/\s+/g, ' ')

  if (normalized.length <= 48) {
    return normalized
  }

  return `${normalized.slice(0, 48).trim()}...`
}
