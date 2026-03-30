import { useMemo, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import {
  ArrowLeft,
  ArrowUp,
  BookOpenText,
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
  Languages,
  MoonStar,
  Search,
  Sparkles,
  SunMedium,
} from 'lucide-react'

type Theme = 'dark' | 'light'
type Language = 'pt' | 'en'
type Screen = 'landing' | 'chat'

type ThemeVariables = CSSProperties & {
  '--page-bg': string
  '--page-gradient': string
  '--page-radial': string
  '--grid-color': string
  '--glow-left': string
  '--glow-right': string
  '--glow-bottom-left': string
  '--glow-bottom-right': string
  '--text-main': string
  '--text-soft': string
  '--text-muted': string
  '--panel-border': string
  '--panel-bg': string
  '--panel-shadow': string
  '--card-border': string
  '--card-bg': string
  '--card-shadow': string
  '--input-bg': string
  '--input-border': string
  '--accent-soft': string
  '--accent-line': string
  '--accent-start': string
  '--accent-mid': string
  '--accent-end': string
  '--accent-shadow': string
}

interface Message {
  id: string
  role: 'assistant' | 'user'
  text: string
}

interface TaskItem {
  title: string
  description: string
  status: 'done' | 'active' | 'next'
}

interface GeminiPart {
  text?: string
}

interface GeminiCandidate {
  content?: {
    parts?: GeminiPart[]
  }
}

interface GeminiResponse {
  candidates?: GeminiCandidate[]
}

interface CopyBlock {
  brandLabel: string
  heroTitle: string
  heroDescription: string
  primaryCta: string
  secondaryCta: string
  featuredLabel: string
  featuredTitle: string
  featuredItems: string[]
  metricItems: Array<{ value: string; label: string }>
  workspaceTitle: string
  workspaceDescription: string
  researchTitle: string
  progressTitle: string
  inputLabel: string
  inputPlaceholder: string
  send: string
  theme: string
  language: string
  chatBadge: string
  insightTitle: string
  insightList: string[]
  researchList: string[]
  quickPrompts: string[]
  tasks: TaskItem[]
  initialMessages: Message[]
  responses: {
    default: string
    ai: string
    research: string
    task: string
    prompt: string
  }
}

const themes: Record<Theme, ThemeVariables> = {
  dark: {
    '--page-bg': '#050916',
    '--page-gradient': 'linear-gradient(180deg,#040716 0%,#071028 45%,#060917 100%)',
    '--page-radial': 'rgba(37,60,148,0.45)',
    '--grid-color': 'rgba(112,151,255,0.07)',
    '--glow-left': 'rgba(72,205,255,0.42)',
    '--glow-right': 'rgba(138,92,255,0.34)',
    '--glow-bottom-left': 'rgba(55,119,255,0.25)',
    '--glow-bottom-right': 'rgba(57,176,255,0.18)',
    '--text-main': '#f8fbff',
    '--text-soft': '#c5d0ef',
    '--text-muted': '#94a3c7',
    '--panel-border': 'rgba(255,255,255,0.1)',
    '--panel-bg': 'linear-gradient(180deg,rgba(18,29,76,0.76),rgba(8,14,37,0.62))',
    '--panel-shadow': 'inset 0 1px 0 rgba(255,255,255,0.08),0 28px 80px rgba(2,6,20,0.45),0 0 0 1px rgba(59,87,180,0.12)',
    '--card-border': 'rgba(127,160,255,0.24)',
    '--card-bg': 'linear-gradient(180deg,rgba(29,45,108,0.28),rgba(8,14,37,0.16))',
    '--card-shadow': 'inset 0 1px 0 rgba(255,255,255,0.12),0 18px 60px rgba(7,12,32,0.38)',
    '--input-bg': 'rgba(9,16,43,0.52)',
    '--input-border': 'rgba(255,255,255,0.1)',
    '--accent-soft': '#9be8ff',
    '--accent-line': '#7ee7ff',
    '--accent-start': '#6fe0ff',
    '--accent-mid': '#687eff',
    '--accent-end': '#8b66ff',
    '--accent-shadow': 'rgba(72,133,255,0.35)',
  },
  light: {
    '--page-bg': '#edf4ff',
    '--page-gradient': 'linear-gradient(180deg,#f9fbff 0%,#edf4ff 42%,#e4eeff 100%)',
    '--page-radial': 'rgba(87,151,255,0.22)',
    '--grid-color': 'rgba(74,113,205,0.08)',
    '--glow-left': 'rgba(98,201,255,0.24)',
    '--glow-right': 'rgba(131,118,255,0.18)',
    '--glow-bottom-left': 'rgba(88,137,255,0.16)',
    '--glow-bottom-right': 'rgba(56,177,255,0.14)',
    '--text-main': '#13203f',
    '--text-soft': '#42557d',
    '--text-muted': '#607297',
    '--panel-border': 'rgba(130,155,222,0.22)',
    '--panel-bg': 'linear-gradient(180deg,rgba(255,255,255,0.82),rgba(232,240,255,0.74))',
    '--panel-shadow': 'inset 0 1px 0 rgba(255,255,255,0.8),0 24px 70px rgba(84,113,173,0.14),0 0 0 1px rgba(132,161,226,0.1)',
    '--card-border': 'rgba(126,156,226,0.26)',
    '--card-bg': 'linear-gradient(180deg,rgba(255,255,255,0.62),rgba(232,240,255,0.42))',
    '--card-shadow': 'inset 0 1px 0 rgba(255,255,255,0.95),0 16px 40px rgba(90,118,170,0.14),0 0 24px rgba(133,188,255,0.14)',
    '--input-bg': 'rgba(255,255,255,0.84)',
    '--input-border': 'rgba(126,156,226,0.2)',
    '--accent-soft': '#1b78d4',
    '--accent-line': '#49a6ff',
    '--accent-start': '#38bdf8',
    '--accent-mid': '#4f7cff',
    '--accent-end': '#7c69ff',
    '--accent-shadow': 'rgba(88,137,255,0.24)',
  },
}

const copy: Record<Language, CopyBlock> = {
  pt: {
    brandLabel: 'Chat educacional com IA',
    heroTitle: 'Aprender com IA, pesquisar melhor e transformar conversa em tarefas reais.',
    heroDescription:
      'Uma interface com cara de produto premium para explicar assuntos, guiar estudo e abrir trilhas de pesquisa sem parecer landing generica.',
    primaryCta: 'Iniciar mentoria',
    secondaryCta: 'Gerar pesquisa',
    featuredLabel: 'Preview shell',
    featuredTitle: 'Chat, tarefas e pesquisa na mesma linguagem premium do sistema.',
    featuredItems: ['Glassmorphism equilibrado', 'Grid tecnico no fundo', 'CTA com gradiente da marca'],
    metricItems: [
      { value: '12+', label: 'formatos de ajuda para estudar e pesquisar' },
      { value: '3 blocos', label: 'explicacao, exemplo e tarefas praticas' },
      { value: '1 fluxo', label: 'chat, trilha de estudo e pesquisa conectados' },
    ],
    workspaceTitle: 'Workspace didatico',
    workspaceDescription: 'Explicacao progressiva, exemplos simples, tarefas de pesquisa e proximos passos no mesmo fluxo.',
    researchTitle: 'Tarefas de pesquisa',
    progressTitle: 'Como a IA responde',
    inputLabel: 'Pergunte algo, peça um plano ou gere uma tarefa',
    inputPlaceholder: 'Ex.: explique machine learning para iniciante e monte 4 tarefas praticas',
    send: 'Enviar',
    theme: 'Tema',
    language: 'Idioma',
    chatBadge: 'Modo tutoria + pesquisa',
    insightTitle: 'Resposta em camadas',
    insightList: ['explicacao simples', 'exemplo aplicado', 'pergunta de fixacao'],
    researchList: ['conceitos base', 'fontes para pesquisar', 'micro tarefas praticas'],
    quickPrompts: [
      'Explique IA generativa com exemplos simples',
      'Crie 5 tarefas de pesquisa sobre machine learning',
      'Monte um plano de estudo de 7 dias sobre prompts',
    ],
    tasks: [
      {
        title: 'Entender o que e IA',
        description: 'Definir com linguagem simples e listar 3 exemplos do dia a dia.',
        status: 'done',
      },
      {
        title: 'Pesquisar machine learning',
        description: 'Comparar aprendizado supervisionado, nao supervisionado e por reforco.',
        status: 'active',
      },
      {
        title: 'Criar perguntas melhores',
        description: 'Escrever 3 prompts com objetivo, contexto e formato esperado.',
        status: 'next',
      },
    ],
    initialMessages: [
      {
        id: 'a1',
        role: 'assistant',
        text: 'Oi. Eu posso ensinar um tema do zero, resumir um conceito dificil e organizar uma pesquisa em tarefas pequenas.',
      },
      {
        id: 'u1',
        role: 'user',
        text: 'Quero aprender inteligencia artificial sem ficar perdido em termos tecnicos.',
      },
      {
        id: 'a2',
        role: 'assistant',
        text: 'Perfeito. Vamos dividir em 3 blocos: o que a IA faz, como ela aprende com dados e como voce pode praticar com exemplos simples.',
      },
    ],
    responses: {
      default:
        'Posso responder isso como aula curta, mapa mental ou plano de pesquisa. Se quiser, tambem separo em tarefas praticas para estudar depois.',
      ai: 'IA e um conjunto de tecnicas usadas para reconhecer padroes, gerar respostas e apoiar decisoes. O jeito mais facil de aprender e ligar conceito, exemplo real e limite da tecnologia.',
      research:
        'Sugestao de pesquisa: 1) defina o conceito com palavras simples, 2) ache 2 exemplos reais, 3) compare vantagens e riscos, 4) escreva um resumo curto com o que voce entendeu.',
      task:
        'Vou quebrar em tarefas: entender a definicao, buscar fontes confiaveis, comparar exemplos práticos e fechar com uma explicacao feita por voce em linguagem simples.',
      prompt:
        'Um prompt melhor para estudo traz objetivo, nivel e formato. Exemplo: explique redes neurais para iniciante em 3 passos, com 2 exemplos e 1 exercicio final.',
    },
  },
  en: {
    brandLabel: 'Educational AI chat',
    heroTitle: 'Learn with AI, research faster, and turn conversation into real study tasks.',
    heroDescription:
      'A premium product-like interface for explanations, guided study, and research planning without falling into generic landing page patterns.',
    primaryCta: 'Start mentoring',
    secondaryCta: 'Build research plan',
    featuredLabel: 'Preview shell',
    featuredTitle: 'Chat, tasks, and research in the same premium system language.',
    featuredItems: ['Balanced glassmorphism', 'Technical background grid', 'Brand gradient CTA'],
    metricItems: [
      { value: '12+', label: 'study and research support formats' },
      { value: '3 layers', label: 'explanation, example, and practical tasks' },
      { value: '1 flow', label: 'chat, study track, and research connected' },
    ],
    workspaceTitle: 'Learning workspace',
    workspaceDescription: 'Progressive explanations, simple examples, research tasks, and next steps in one flow.',
    researchTitle: 'Research tasks',
    progressTitle: 'How the AI responds',
    inputLabel: 'Ask a question, request a plan, or generate tasks',
    inputPlaceholder: 'Example: explain machine learning for beginners and create 4 practice tasks',
    send: 'Send',
    theme: 'Theme',
    language: 'Language',
    chatBadge: 'Tutoring + research mode',
    insightTitle: 'Layered answer',
    insightList: ['simple explanation', 'applied example', 'retention question'],
    researchList: ['core concepts', 'recommended sources', 'practical micro tasks'],
    quickPrompts: [
      'Explain generative AI with simple examples',
      'Create 5 research tasks about machine learning',
      'Build a 7-day study plan for better prompts',
    ],
    tasks: [
      {
        title: 'Understand what AI is',
        description: 'Define it in simple language and list 3 everyday examples.',
        status: 'done',
      },
      {
        title: 'Research machine learning',
        description: 'Compare supervised, unsupervised, and reinforcement learning.',
        status: 'active',
      },
      {
        title: 'Write stronger prompts',
        description: 'Create 3 prompts with goal, context, and expected format.',
        status: 'next',
      },
    ],
    initialMessages: [
      {
        id: 'a1',
        role: 'assistant',
        text: 'Hi. I can teach a topic from scratch, simplify a hard concept, and break research into smaller study tasks.',
      },
      {
        id: 'u1',
        role: 'user',
        text: 'I want to learn artificial intelligence without getting lost in technical jargon.',
      },
      {
        id: 'a2',
        role: 'assistant',
        text: 'Great. We can split it into 3 blocks: what AI does, how it learns from data, and how you can practice with simple examples.',
      },
    ],
    responses: {
      default:
        'I can answer that as a mini lesson, a study map, or a research plan. I can also break it into practical tasks for later study.',
      ai: 'AI is a set of techniques used to detect patterns, generate responses, and support decisions. The easiest way to learn it is to connect concept, real example, and limitation.',
      research:
        'Research track: 1) define the concept in simple words, 2) find 2 real examples, 3) compare benefits and risks, 4) write a short summary in your own words.',
      task:
        'I would break this into tasks: understand the definition, gather trusted sources, compare practical examples, and finish with your own plain-language explanation.',
      prompt:
        'A better study prompt includes goal, level, and response format. Example: explain neural networks for a beginner in 3 steps, with 2 examples and 1 final exercise.',
    },
  },
}

const googleAiApiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY?.trim()
const googleAiApiUrl = googleAiApiKey
  ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${googleAiApiKey}`
  : ''

function App() {
  const [theme, setTheme] = useState<Theme>('dark')
  const [language, setLanguage] = useState<Language>('pt')
  const [screen, setScreen] = useState<Screen>('landing')
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<Message[]>(copy.pt.initialMessages)
  const [isLoading, setIsLoading] = useState(false)

  const t = copy[language]
  const themeStyle = useMemo(() => themes[theme], [theme])

  function getAssistantReply(text: string) {
    const normalized = text.toLowerCase()

    if (normalized.includes('ia') || normalized.includes('ai') || normalized.includes('artificial')) {
      return t.responses.ai
    }
    if (normalized.includes('pesquisa') || normalized.includes('research')) {
      return t.responses.research
    }
    if (normalized.includes('tarefa') || normalized.includes('task') || normalized.includes('plano')) {
      return t.responses.task
    }
    if (normalized.includes('prompt')) {
      return t.responses.prompt
    }

    return t.responses.default
  }

  async function getGoogleAiReply(text: string) {
    if (!googleAiApiUrl) {
      return language === 'pt'
        ? 'Configure `VITE_GOOGLE_AI_API_KEY` no seu `.env` para ativar as respostas da Google AI. Enquanto isso, sigo com a resposta local do app.'
        : 'Set `VITE_GOOGLE_AI_API_KEY` in your `.env` to enable Google AI responses. Until then, I will keep using the app local reply.'
    }

    const prompt = language === 'pt'
      ? `Voce e um tutor de IA educacional. Responda em portugues do Brasil com clareza, de forma didatica e objetiva. Pergunta do usuario: ${text}`
      : `You are an educational AI tutor. Reply in clear, concise English with a didactic tone. User question: ${text}`

    const response = await fetch(googleAiApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`Google AI request failed with status ${response.status}`)
    }

    const data = (await response.json()) as GeminiResponse
    const reply = data.candidates?.[0]?.content?.parts?.map((part) => part.text?.trim()).filter(Boolean).join('\n\n')

    if (!reply) {
      throw new Error('Google AI returned an empty response')
    }

    return reply
  }

  async function submitMessage(text: string) {
    const value = text.trim()

    if (!value || isLoading) {
      return
    }

    const nextUserMessage: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: value,
    }

    setMessages((current) => [...current, nextUserMessage])
    setDraft('')

    try {
      setIsLoading(true)

      const assistantReply = googleAiApiKey ? await getGoogleAiReply(value) : getAssistantReply(value)

      setMessages((current) => [
        ...current,
        {
          id: `a-${Date.now() + 1}`,
          role: 'assistant',
          text: assistantReply,
        },
      ])
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `a-${Date.now() + 1}`,
          role: 'assistant',
          text: `${getAssistantReply(value)}\n\n${language === 'pt' ? 'Nao consegui consultar a Google AI agora.' : 'I could not reach Google AI right now.'}`,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void submitMessage(draft)
  }

  function switchLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage)
    setMessages(copy[nextLanguage].initialMessages)
    setDraft('')
  }

  const statusLabel: Record<TaskItem['status'], string> = language === 'pt'
    ? { done: 'Concluido', active: 'Em andamento', next: 'Proximo' }
    : { done: 'Done', active: 'Active', next: 'Next' }

  return (
    <div
      className="min-h-screen overflow-hidden bg-[var(--page-bg)] text-[color:var(--text-soft)] [font-family:Outfit,Segoe_UI,sans-serif] transition-colors duration-300"
      style={themeStyle}
    >
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_14%,var(--page-radial),transparent_36%),var(--page-gradient)]" />
      <div className="pointer-events-none fixed inset-0 grid-mask opacity-35" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_16%,var(--glow-left),transparent_26%)] blur-3xl" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_84%_18%,var(--glow-right),transparent_23%)] blur-3xl" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_26%_84%,var(--glow-bottom-left),transparent_25%)] blur-3xl" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_76%_86%,var(--glow-bottom-right),transparent_24%)] blur-3xl" />

      <div className="pointer-events-none fixed bottom-8 left-6 z-30 hidden lg:block">
        <button
          type="button"
          onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
          className="pointer-events-auto group flex h-14 w-14 items-center overflow-hidden rounded-[20px] border border-[color:var(--panel-border)] accent-button text-white transition-[width,transform] duration-300 ease-out hover:w-36 hover:-translate-y-0.5"
          aria-label={t.theme}
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center">
            {theme === 'dark' ? <SunMedium size={18} /> : <MoonStar size={18} />}
          </span>
          <span className="min-w-max whitespace-nowrap pr-5 text-sm font-medium uppercase tracking-[0.08em] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {t.theme}
          </span>
        </button>
      </div>

      <div className="fixed bottom-8 right-6 z-30 hidden lg:block">
        <div className="glass-panel inline-flex h-14 items-center gap-2 rounded-[20px] px-3 text-[color:var(--text-main)]">
          <span className="pl-1 font-['IBM_Plex_Mono'] text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
            {t.language}
          </span>
          <div className="relative grid grid-cols-2 items-center rounded-[16px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] p-1">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.125rem)] rounded-[12px] bg-[linear-gradient(135deg,var(--accent-start),var(--accent-mid)_55%,var(--accent-end))] shadow-[0_0_18px_var(--accent-shadow)] transition-transform duration-300 ease-out"
              style={{ transform: `translateX(${language === 'pt' ? '0%' : '100%'})` }}
            />
            {(['pt', 'en'] as const).map((option) => {
              const active = language === option

              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => switchLanguage(option)}
                  className={[
                    'relative z-10 inline-flex h-8 min-w-11 items-center justify-center rounded-[12px] px-3 font-[IBM_Plex_Mono] text-[0.68rem] font-semibold uppercase tracking-[0.16em] transition',
                    active ? 'text-white' : 'text-[color:var(--text-soft)] hover:text-[color:var(--text-main)]',
                  ].join(' ')}
                >
                  {option.toUpperCase()}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <main className={[
        'relative z-10 mx-auto p-4',
        screen === 'landing' ? 'max-w-[1180px]' : 'max-w-[1880px]',
      ].join(' ')}>
        {screen === 'landing' ? (
          <>
            <section className="glass-panel rounded-[28px] px-5 py-5 sm:px-8 sm:py-7 lg:px-10 lg:py-10">
              <div className="grid gap-10 lg:grid-cols-[minmax(0,1.06fr)_minmax(340px,0.94fr)] lg:items-center">
                <div>
                  <span className="section-label">{t.brandLabel}</span>
                  <h1 className="mt-5 max-w-[11ch] font-['Space_Grotesk'] text-[clamp(2.55rem,7vw,4.85rem)] font-bold leading-[0.96] tracking-[-0.05em] text-[color:var(--text-main)]">
                    {t.heroTitle}
                  </h1>
                  <p className="mt-5 max-w-[38rem] text-base leading-7 text-[color:var(--text-soft)] sm:text-[1.05rem]">
                    {t.heroDescription}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3.5">
                    <button
                      type="button"
                      onClick={() => {
                        submitMessage(t.quickPrompts[0])
                        setScreen('chat')
                      }}
                      className="accent-aura accent-button rounded-full px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                    >
                      {t.primaryCta}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        submitMessage(t.quickPrompts[1])
                        setScreen('chat')
                      }}
                      className="rounded-full border border-[color:var(--card-border)] bg-transparent px-6 py-3.5 text-sm font-medium text-[color:var(--text-main)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent-line)]"
                    >
                      {t.secondaryCta}
                    </button>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    {[t.workspaceTitle, t.researchTitle, t.progressTitle].map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full border border-[color:var(--card-border)] bg-transparent px-3.5 py-2.5 font-['IBM_Plex_Mono'] text-[0.72rem] uppercase tracking-[0.14em] text-[color:var(--text-soft)]"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="relative hidden min-h-[460px] overflow-visible lg:block">
                  <div className="glass-card absolute left-0 top-14 z-20 w-[56%] rounded-[28px] p-5">
                    <span className="font-['IBM_Plex_Mono'] text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--accent-soft)]">
                      {t.featuredLabel}
                    </span>
                    <div className="mt-4 h-24 rounded-[22px] border border-[color:var(--card-border)] bg-transparent" />
                    <div className="mt-4 space-y-2.5">
                      {t.featuredItems.map((item) => (
                        <div key={item} className="rounded-full border border-[color:var(--card-border)] bg-transparent px-3 py-2 text-sm text-[color:var(--text-soft)]">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card absolute right-0 top-0 z-30 w-[68%] rounded-[28px] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-['IBM_Plex_Mono'] text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--accent-soft)]">
                        {t.chatBadge}
                      </span>
                      <div className="flex gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--accent-line)]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-white/35" />
                        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                      </div>
                    </div>
                    <div className="mt-4 rounded-[22px] border border-[color:var(--card-border)] bg-transparent p-4">
                      <p className="font-['IBM_Plex_Mono'] text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Mentor AI</p>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">{messages[0]?.text}</p>
                    </div>
                    <div className="mt-3 rounded-[22px] border border-[color:var(--card-border)] bg-[linear-gradient(180deg,rgba(31,59,138,0.28),rgba(13,24,64,0.12))] p-4">
                      <p className="font-['IBM_Plex_Mono'] text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                        {language === 'pt' ? 'Voce' : 'You'}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">{messages[1]?.text}</p>
                    </div>
                  </div>

                  <div className="glass-card absolute left-[12%] top-60 z-40 w-[64%] rounded-[28px] p-5">
                    <h2 className="font-['Space_Grotesk'] text-[1.18rem] font-bold tracking-[-0.03em] text-[color:var(--text-main)]">
                      {t.featuredTitle}
                    </h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {t.metricItems.map((metric) => (
                        <div key={metric.label} className="rounded-[20px] border border-[color:var(--card-border)] bg-transparent p-3.5">
                          <p className="font-['Space_Grotesk'] text-[1.35rem] font-bold tracking-[-0.04em] text-[color:var(--text-main)]">
                            {metric.value}
                          </p>
                          <p className="mt-1.5 text-sm leading-5 text-[color:var(--text-muted)]">{metric.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {t.metricItems.map((metric, index) => (
                <article key={metric.label} className="glass-card rounded-[24px] p-5">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-[18px] bg-transparent text-[color:var(--accent-soft)]">
                    {index === 0 ? <BrainCircuit size={18} /> : index === 1 ? <BookOpenText size={18} /> : <ClipboardList size={18} />}
                  </div>
                  <p className="font-['Space_Grotesk'] text-[1.6rem] font-bold tracking-[-0.04em] text-[color:var(--text-main)]">
                    {metric.value}
                  </p>
                  <p className="mt-1.5 text-sm leading-6 text-[color:var(--text-muted)]">{metric.label}</p>
                </article>
              ))}
            </div>

            <section className="mt-5 glass-panel rounded-[28px] p-5 sm:p-6 lg:p-7">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.82fr)] lg:items-start">
                <div>
                  <span className="section-label">{t.progressTitle}</span>
                  <h2 className="mt-3 max-w-[14ch] font-['Space_Grotesk'] text-[clamp(1.9rem,4vw,3rem)] font-bold leading-[0.98] tracking-[-0.05em] text-[color:var(--text-main)]">
                    {language === 'pt' ? 'Uma tela inicial para apresentar o produto antes do chat.' : 'A landing introduces the product before the chat.'}
                  </h2>
                </div>
                <div className="grid gap-3">
                  {t.quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => {
                        void submitMessage(prompt)
                        setScreen('chat')
                      }}
                      className="glass-card rounded-[22px] p-4 text-left text-sm leading-6 text-[color:var(--text-soft)] transition hover:-translate-y-0.5 hover:text-[color:var(--text-main)]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </>
        ) : (
          <div className="grid gap-4 lg:h-[calc(100vh-2rem)] lg:grid-cols-[minmax(0,1.78fr)_minmax(360px,0.62fr)] lg:overflow-hidden">
          <section className="glass-panel flex min-h-0 flex-col rounded-[28px] px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5 lg:px-7 lg:pb-7 lg:pt-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--panel-border)] pb-4">
              <div>
                <span className="section-label">{t.brandLabel}</span>
                <h2 className="mt-3 font-['Space_Grotesk'] text-[1.7rem] font-bold tracking-[-0.04em] text-[color:var(--text-main)]">
                  {t.workspaceTitle}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setScreen('landing')}
                  className="inline-flex items-center gap-2 rounded-full border border-[color:var(--card-border)] bg-transparent px-4 py-2 text-sm font-medium text-[color:var(--text-main)] transition hover:-translate-y-0.5"
                >
                  <ArrowLeft size={16} />
                  {language === 'pt' ? 'Voltar' : 'Back'}
                </button>
                <div className="hidden rounded-full border border-[color:var(--card-border)] bg-transparent px-4 py-2 font-['IBM_Plex_Mono'] text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--accent-soft)] sm:inline-flex">
                  <Sparkles size={14} className="mr-2" />
                  {t.chatBadge}
                </div>
              </div>
            </div>

            <div className="app-scroll mt-4 grid min-h-0 flex-1 gap-3 overflow-y-auto pr-1">
              {messages.map((message) => (
                <article
                  key={message.id}
                  className={[
                    'glass-card w-fit rounded-[24px] p-4',
                    message.role === 'user'
                      ? 'ml-auto max-w-[760px] bg-[linear-gradient(180deg,rgba(31,59,138,0.42),rgba(13,24,64,0.24))]'
                      : 'max-w-[820px]',
                  ].join(' ')}
                >
                  <span className="font-['IBM_Plex_Mono'] text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                    {message.role === 'assistant' ? 'Mentor AI' : language === 'pt' ? 'Voce' : 'You'}
                  </span>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--text-soft)] sm:text-[0.97rem]">{message.text}</p>
                </article>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
              <label className="font-['IBM_Plex_Mono'] text-[0.72rem] uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                {t.inputLabel}
              </label>
              <div className="glass-card rounded-[26px] p-3 sm:p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    rows={3}
                    disabled={isLoading}
                    placeholder={t.inputPlaceholder}
                    className="min-h-[84px] flex-1 resize-none rounded-[22px] border border-[color:var(--input-border)] bg-[color:var(--input-bg)] px-4 py-3.5 text-[color:var(--text-main)] outline-none transition placeholder:text-[color:var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-70 focus:border-[color:var(--accent-line)]"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="accent-button inline-flex h-14 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isLoading ? (language === 'pt' ? 'Enviando...' : 'Sending...') : t.send}
                    <ArrowUp size={16} />
                  </button>
                </div>
              </div>
            </form>
          </section>

          <section className="glass-panel flex min-h-0 flex-col rounded-[28px] px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
            <div className="app-scroll min-h-0 flex-1 overflow-y-auto pr-1">
            <section className="rounded-[24px] border border-[color:var(--card-border)] bg-transparent p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="section-label">{t.researchTitle}</span>
                  <h2 className="mt-3 font-['Space_Grotesk'] text-[1.55rem] font-bold tracking-[-0.04em] text-[color:var(--text-main)]">
                    {language === 'pt' ? 'Trilhas de estudo e pesquisa em tempo real.' : 'Study and research tracks in real time.'}
                  </h2>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {t.tasks.map((task) => (
                  <article
                    key={task.title}
                    className={[
                      'glass-card rounded-[24px] p-5',
                      task.status === 'active' ? 'border-[color:var(--accent-line)]/45' : '',
                      task.status === 'done' ? 'opacity-80' : '',
                    ].join(' ')}
                  >
                    <span className="font-['IBM_Plex_Mono'] text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--accent-soft)]">
                      {statusLabel[task.status]}
                    </span>
                    <h3 className="mt-3 font-['Space_Grotesk'] text-[1.05rem] font-bold tracking-[-0.03em] text-[color:var(--text-main)]">
                      {task.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">{task.description}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-4 rounded-[24px] border border-[color:var(--card-border)] bg-transparent p-5 sm:p-6">
              <span className="section-label">{t.progressTitle}</span>
              <div className="mt-5 grid gap-3">
                {[
                  { icon: BookOpenText, title: t.insightTitle, items: t.insightList },
                  { icon: Search, title: t.researchTitle, items: t.researchList },
                ].map((block) => (
                  <article key={block.title} className="glass-card rounded-[24px] p-4">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-[color:var(--input-bg)] text-[color:var(--accent-soft)]">
                        <block.icon size={17} />
                      </div>
                      <h3 className="font-['Space_Grotesk'] text-[1rem] font-bold tracking-[-0.03em] text-[color:var(--text-main)]">
                        {block.title}
                      </h3>
                    </div>
                    <ul className="grid gap-2">
                      {block.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-[color:var(--text-soft)]">
                          <CheckCircle2 size={15} className="text-[color:var(--accent-line)]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-4 rounded-[24px] border border-[color:var(--card-border)] bg-transparent p-5 sm:p-6 lg:min-h-0">
              <span className="section-label">Prompt shortcuts</span>
              <div className="mt-5 grid gap-3">
                {t.quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => submitMessage(prompt)}
                    className="glass-card rounded-[22px] p-4 text-left text-sm leading-6 text-[color:var(--text-soft)] transition hover:-translate-y-0.5 hover:text-[color:var(--text-main)]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-[26px] border border-[color:var(--card-border)] bg-transparent p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="accent-aura flex h-11 w-11 items-center justify-center rounded-[18px] accent-button text-white">
                    <Languages size={18} />
                  </div>
                  <div>
                    <p className="font-['IBM_Plex_Mono'] text-[0.68rem] uppercase tracking-[0.16em] text-[color:var(--accent-soft)]">
                      {language === 'pt' ? 'Assistente de estudo' : 'Study assistant'}
                    </p>
                    <h3 className="font-['Space_Grotesk'] text-[1.05rem] font-bold tracking-[-0.03em] text-[color:var(--text-main)]">
                      {language === 'pt' ? 'Pesquisa com resposta guiada' : 'Research with guided response'}
                    </h3>
                  </div>
                </div>
                <p className="text-sm leading-6 text-[color:var(--text-muted)]">
                  {language === 'pt'
                    ? 'O fluxo junta explicacao, checklist, sugestao de fontes e tarefas pequenas para voce aprender e pesquisar no mesmo ambiente.'
                    : 'The flow combines explanation, checklist, source suggestions, and small tasks so learning and research happen in the same environment.'}
                </p>
              </div>
            </section>
            </div>

            <div className="mt-4 flex justify-center lg:hidden">
              <div className="glass-card inline-flex items-center gap-2 rounded-full p-1 text-xs text-[color:var(--text-muted)]">
                <span className="px-3 font-['IBM_Plex_Mono'] uppercase tracking-[0.14em]">{t.language}</span>
                <div className="relative grid grid-cols-2 items-center rounded-full border border-[color:var(--card-border)] bg-[color:var(--input-bg)] p-1">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.125rem)] rounded-full bg-[linear-gradient(135deg,var(--accent-start),var(--accent-mid)_55%,var(--accent-end))] shadow-[0_0_18px_var(--accent-shadow)] transition-transform duration-300 ease-out"
                    style={{ transform: `translateX(${language === 'pt' ? '0%' : '100%'})` }}
                  />
                  {(['pt', 'en'] as const).map((option) => {
                    const active = language === option

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => switchLanguage(option)}
                        className={active
                          ? 'relative z-10 inline-flex h-8 items-center rounded-full px-3 font-medium text-white'
                          : 'relative z-10 inline-flex h-8 items-center rounded-full px-3 transition hover:text-[color:var(--text-main)]'}
                      >
                        {option.toUpperCase()}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>
        )}
      </main>
    </div>
  )
}

export default App
