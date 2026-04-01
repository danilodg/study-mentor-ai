import type { CopyBlock } from '../../types/chat'

export const enCopy: CopyBlock = {
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
  previewAssistantText: 'I can explain a topic, build a study plan, and turn the conversation into practical tasks.',
  previewUserText: 'I want to learn AI without getting lost in technical jargon.',
  inputLabel: 'Ask a question, request a plan, or generate tasks',
  inputPlaceholder: 'Example: explain machine learning for beginners and create 4 practice tasks',
  send: 'Send',
  newChat: 'New chat',
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
  initialMessages: [],
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
}
