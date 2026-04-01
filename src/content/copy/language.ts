import type {
  ConversationMode,
  DifficultyLevel,
  ExamFlow,
  ExamProfile,
  ForcedResponseMode,
  Language,
  ResponseMode,
} from '../../types/chat'

export const systemInstructionByLanguage: Record<Language, string> = {
  pt: [
    'Voce e o Study Mentor AI, um tutor educacional claro e pratico.',
    'Responda sempre em portugues do Brasil.',
    'Explique com linguagem simples, sem soar robotico.',
    'Quando fizer sentido, organize a resposta em: explicacao, exemplo e proximo passo.',
    'Mantenha foco em aprendizagem, pesquisa e tarefas praticas.',
    'Use markdown simples e limpo para formatar melhor a resposta.',
    'Pode usar negrito, listas e subtitulos curtos quando isso ajudar a leitura.',
    'Nao use tabelas e nao exagere na formatacao.',
    'Nao se apresente, nao diga seu nome e nao comece com saudacoes padrao, a menos que o usuario peca isso.',
    'Nao use separadores com --- nem titulos decorados.',
    'Responda sempre em JSON valido.',
    'Tipos aceitos: text, quiz_mcq, true_false e short_answer.',
    'Para text, use: {"type":"text","text":"..."}.',
    'Para quiz_mcq, use: {"type":"quiz_mcq","id":"...","topic":"...","question":"...","options":[{"id":"A","text":"..."},{"id":"B","text":"..."},{"id":"C","text":"..."},{"id":"D","text":"..."}],"correctOptionId":"A|B|C|D","explanation":"..."}.',
    'Para true_false, use: {"type":"true_false","id":"...","topic":"...","statement":"...","correctAnswer":true|false,"explanation":"..."}.',
    'Para short_answer, use: {"type":"short_answer","id":"...","topic":"...","question":"...","sampleAnswer":"...","evaluationCriteria":["...","...","..."]}.',
    'Quando o usuario pedir atividade, questao ou multipla escolha, retorne quiz_mcq.',
    'Voce pode usar markdown simples nos campos de texto desses tipos para melhorar leitura.',
  ].join(' '),
  en: [
    'You are Study Mentor AI, a clear and practical educational tutor.',
    'Always answer in English.',
    'Use simple language and avoid robotic phrasing.',
    'When helpful, structure the answer as explanation, example, and next step.',
    'Keep the focus on learning, research, and practical tasks.',
    'Use simple clean markdown to improve readability.',
    'You may use bold text, lists, and short subheadings when helpful.',
    'Do not use tables and do not over-format the answer.',
    'Do not introduce yourself, mention your name, or start with default greetings unless the user asks for it.',
    'Do not use --- separators or decorative headings.',
    'Always return valid JSON.',
    'Allowed types: text, quiz_mcq, true_false, and short_answer.',
    'For text, use: {"type":"text","text":"..."}.',
    'For quiz_mcq, use: {"type":"quiz_mcq","id":"...","topic":"...","question":"...","options":[{"id":"A","text":"..."},{"id":"B","text":"..."},{"id":"C","text":"..."},{"id":"D","text":"..."}],"correctOptionId":"A|B|C|D","explanation":"..."}.',
    'For true_false, use: {"type":"true_false","id":"...","topic":"...","statement":"...","correctAnswer":true|false,"explanation":"..."}.',
    'For short_answer, use: {"type":"short_answer","id":"...","topic":"...","question":"...","sampleAnswer":"...","evaluationCriteria":["...","...","..."]}.',
    'When the user asks for an activity, question, or multiple-choice exercise, return quiz_mcq.',
    'You may use simple markdown in text fields to improve readability.',
  ].join(' '),
}

export const responseModeOptions: ResponseMode[] = ['auto', 'quiz_mcq', 'true_false', 'short_answer']

export const responseModeLabel: Record<Language, Record<ResponseMode, string>> = {
  pt: {
    auto: 'Auto',
    quiz_mcq: 'Multipla escolha',
    true_false: 'Verdadeiro/Falso',
    short_answer: 'Resposta curta',
  },
  en: {
    auto: 'Auto',
    quiz_mcq: 'Multiple choice',
    true_false: 'True/False',
    short_answer: 'Short answer',
  },
}

export const conversationModeLabel: Record<Language, Record<ConversationMode, string>> = {
  pt: {
    chat: 'Chat normal',
    exam: 'Modo prova',
  },
  en: {
    chat: 'Normal chat',
    exam: 'Exam mode',
  },
}

export const difficultyLabel: Record<Language, Record<DifficultyLevel, string>> = {
  pt: {
    auto: 'Auto',
    easy: 'Facil',
    medium: 'Medio',
    hard: 'Dificil',
  },
  en: {
    auto: 'Auto',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
  },
}

export const examProfileLabel: Record<Language, Record<ExamProfile, string>> = {
  pt: {
    general: 'Prova geral',
    enem: 'ENEM',
  },
  en: {
    general: 'General exam',
    enem: 'ENEM style',
  },
}

export const examFlowLabel: Record<Language, Record<ExamFlow, string>> = {
  pt: {
    single: 'Questoes avulsas',
    passage: 'Texto + 4 questoes',
  },
  en: {
    single: 'Single questions',
    passage: 'Passage + 4 questions',
  },
}

export function getResponseModeInstruction(language: Language, mode: ForcedResponseMode) {
  if (mode === 'text') {
    return language === 'pt'
      ? 'Modo de resposta: FORCADO em text. Retorne exatamente esse tipo.'
      : 'Response mode: FORCED to text. Return exactly that type.'
  }

  if (mode === 'auto') {
    return language === 'pt'
      ? 'Modo de resposta: AUTO. Escolha o melhor tipo entre text, quiz_mcq, true_false e short_answer.'
      : 'Response mode: AUTO. Choose the best type among text, quiz_mcq, true_false, and short_answer.'
  }

  return language === 'pt'
    ? `Modo de resposta: FORCADO em ${mode}. Retorne exatamente esse tipo.`
    : `Response mode: FORCED to ${mode}. Return exactly that type.`
}
