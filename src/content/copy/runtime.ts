import type { DifficultyLevel, ExamFlow, ExamProfile, Language } from '../../types/chat'

export function getLocale(language: Language) {
  return language === 'pt' ? 'pt-BR' : 'en-US'
}

export function getMissingApiKeyMessage(language: Language) {
  return language === 'pt'
    ? 'Configure `VITE_GOOGLE_AI_API_KEY` no seu `.env` para ativar as respostas da Google AI. Enquanto isso, sigo com a resposta local do app.'
    : 'Set `VITE_GOOGLE_AI_API_KEY` in your `.env` to enable Google AI responses. Until then, I will keep using the app local reply.'
}

export function getAiUnavailableMessage(language: Language, waitSeconds: number, isRateLimitError: boolean) {
  if (isRateLimitError) {
    return language === 'pt'
      ? `Limite da API atingido. ${waitSeconds > 0 ? `Tente novamente em ${waitSeconds}s.` : 'Tente novamente em instantes.'}`
      : `API limit reached. ${waitSeconds > 0 ? `Try again in ${waitSeconds}s.` : 'Please try again shortly.'}`
  }

  return language === 'pt'
    ? 'Nao consegui consultar a IA agora. Tente novamente.'
    : 'I could not reach AI right now. Please try again.'
}

export function getExamCompletionText(language: Language) {
  return language === 'pt'
    ? 'Bloco finalizado. Se quiser, posso gerar um novo texto com mais 4 questoes.'
    : 'Set completed. I can generate a new passage with 4 more questions if you want.'
}

export function getQuestionHistoryInstruction(language: Language, recentQuestionHistory: string[]) {
  if (recentQuestionHistory.length === 0) {
    return ''
  }

  return language === 'pt'
    ? [
      'Historico de perguntas recentes (somente enunciados):',
      ...recentQuestionHistory.map((question, index) => `${index + 1}. ${question}`),
      'Crie uma NOVA pergunta diferente das anteriores. Nao repita o enunciado nem variacoes superficiais.',
      'Pode reaproveitar o tema geral, mas mude o foco/subtema.',
    ].join(' ')
    : [
      'Recent question history (questions only):',
      ...recentQuestionHistory.map((question, index) => `${index + 1}. ${question}`),
      'Create a NEW question that is different from the previous ones. Do not repeat wording or superficial variations.',
      'You may keep the overall topic, but change the focus/subtopic.',
    ].join(' ')
}

export function getExamProfileInstruction(language: Language, profile: ExamProfile) {
  if (profile === 'enem') {
    return language === 'pt'
      ? 'Perfil da prova: ENEM. Priorize contexto, interpretacao e aplicacao pratica.'
      : 'Exam profile: ENEM style. Prioritize context, interpretation, and practical application.'
  }

  return language === 'pt'
    ? 'Perfil da prova: geral.'
    : 'Exam profile: general.'
}

export function getTopicInstruction(language: Language, topic: string) {
  const trimmed = topic.trim()
  if (trimmed) {
    return language === 'pt'
      ? `Assunto preferencial: ${trimmed}.`
      : `Preferred topic: ${trimmed}.`
  }

  return language === 'pt'
    ? 'Assunto: escolha autonomamente um tema recorrente de prova para esta dificuldade.'
    : 'Topic: autonomously choose a common exam topic for this difficulty.'
}

export function getPassagePrompt(language: Language) {
  return language === 'pt'
    ? 'Crie um texto-base curto para prova.'
    : 'Create a short exam reading passage.'
}

function getDifficultyInstruction(language: Language, difficulty: DifficultyLevel) {
  if (difficulty === 'auto') {
    return language === 'pt' ? 'Dificuldade: auto.' : 'Difficulty: auto.'
  }

  return language === 'pt'
    ? `Dificuldade: ${difficulty}.`
    : `Difficulty: ${difficulty}.`
}

export function getPassageExtraInstruction(
  language: Language,
  profileInstruction: string,
  topicInstruction: string,
  difficulty: DifficultyLevel,
) {
  return language === 'pt'
    ? [
      profileInstruction,
      topicInstruction,
      getDifficultyInstruction(language, difficulty),
      'Retorne somente texto no campo text (sem perguntas, sem gabarito).',
      'O texto deve ser claro e ter de 120 a 220 palavras.',
    ].join(' ')
    : [
      profileInstruction,
      topicInstruction,
      getDifficultyInstruction(language, difficulty),
      'Return only passage text in the text field (no questions, no answers).',
      'The passage should be clear and around 120 to 220 words.',
    ].join(' ')
}

export function getQuestionPrompt(language: Language, nextQuestionNumber: number, flow: ExamFlow, passageText: string) {
  if (flow === 'passage' && passageText) {
    return language === 'pt'
      ? `Com base no texto abaixo, gere a questao ${nextQuestionNumber}.\n\nTexto-base:\n${passageText}`
      : `Based on the text below, generate question ${nextQuestionNumber}.\n\nPassage:\n${passageText}`
  }

  return language === 'pt'
    ? `Gere a questao ${nextQuestionNumber}.`
    : `Generate question ${nextQuestionNumber}.`
}

export function getQuestionExtraInstruction(
  language: Language,
  profileInstruction: string,
  topicInstruction: string,
  difficulty: DifficultyLevel,
  flow: ExamFlow,
  nextQuestionNumber: number,
  maxQuestions: number,
  historyInstruction: string,
) {
  return language === 'pt'
    ? [
      'Contexto de prova: retorne apenas um dos tipos quiz_mcq, true_false ou short_answer.',
      'Nao retorne text neste fluxo de prova.',
      profileInstruction,
      topicInstruction,
      getDifficultyInstruction(language, difficulty),
      flow === 'passage'
        ? `Este e um bloco baseado no mesmo texto. Gere a questao ${nextQuestionNumber} de ${maxQuestions || 4} variando habilidade cognitiva.`
        : '',
      historyInstruction,
    ].join(' ')
    : [
      'Exam context: return only quiz_mcq, true_false, or short_answer.',
      'Do not return text in this exam flow.',
      profileInstruction,
      topicInstruction,
      getDifficultyInstruction(language, difficulty),
      flow === 'passage'
        ? `This is a single passage-based set. Generate question ${nextQuestionNumber} of ${maxQuestions || 4} with varied cognitive skills.`
        : '',
      historyInstruction,
    ].join(' ')
}

export function getExamFallbackText(language: Language, isQuotaError: boolean, waitSeconds: number) {
  if (isQuotaError) {
    return language === 'pt'
      ? `Sua cota da API foi atingida. Aguarde ${waitSeconds || 30}s e tente novamente.`
      : `Your API quota has been reached. Wait ${waitSeconds || 30}s and try again.`
  }

  return language === 'pt'
    ? 'Nao consegui gerar a proxima questao agora. Tente novamente.'
    : 'I could not generate the next question right now. Please try again.'
}

export function getExamInvalidFormatText(language: Language) {
  return language === 'pt'
    ? 'A questao veio em formato invalido para o modo prova. Toque em "Tentar novamente" para regenerar esta mesma questao.'
    : 'The question came in an invalid exam format. Tap "Try again" to regenerate this same question.'
}

export function getPendingExamText(language: Language, flow: ExamFlow) {
  if (flow === 'passage') {
    return language === 'pt'
      ? 'Gerando texto-base e primeira questao...'
      : 'Generating base passage and first question...'
  }

  return language === 'pt'
    ? 'Gerando a primeira questao da prova...'
    : 'Generating the first exam question...'
}

export function getPendingNextExamText(language: Language, flow: ExamFlow) {
  if (flow === 'passage') {
    return language === 'pt'
      ? 'Gerando proxima questao...'
      : 'Generating next question...'
  }

  return language === 'pt'
    ? 'Gerando questao da prova...'
    : 'Generating exam question...'
}
