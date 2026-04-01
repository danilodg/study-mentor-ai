import type { CopyBlock, Language } from '../../types/chat'
import { enCopy } from './en'
import { ptCopy } from './pt'

export const copy: Record<Language, CopyBlock> = {
  pt: ptCopy,
  en: enCopy,
}

export {
  conversationModeLabel,
  difficultyLabel,
  examFlowLabel,
  examProfileLabel,
  getResponseModeInstruction,
  responseModeLabel,
  responseModeOptions,
  systemInstructionByLanguage,
} from './language'

export {
  getAiUnavailableMessage,
  getExamCompletionText,
  getExamFallbackText,
  getExamProfileInstruction,
  getLocale,
  getMissingApiKeyMessage,
  getPassageExtraInstruction,
  getPassagePrompt,
  getPendingExamText,
  getQuestionExtraInstruction,
  getQuestionHistoryInstruction,
  getQuestionPrompt,
  getTopicInstruction,
} from './runtime'

export {
  getProfilePlansCopy,
} from './plans'

export type {
  ProfilePlansCopy,
} from './plans'
