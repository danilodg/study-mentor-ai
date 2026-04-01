import type { CopyBlock } from '../../types/chat'

export const ptCopy: CopyBlock = {
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
  previewAssistantText: 'Posso explicar um tema, montar um plano de estudo e transformar a conversa em tarefas praticas.',
  previewUserText: 'Quero aprender IA sem me perder em termos tecnicos.',
  inputLabel: 'Pergunte algo, peça um plano ou gere uma tarefa',
  inputPlaceholder: 'Ex.: explique machine learning para iniciante e monte 4 tarefas praticas',
  send: 'Enviar',
  newChat: 'Nova conversa',
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
  initialMessages: [],
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
}
