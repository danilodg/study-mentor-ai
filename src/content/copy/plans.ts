import type { Language } from '../../types/chat'

type PlanCode = 'free' | 'pro'

export interface PlanCopy {
  code: PlanCode
  title: string
  price: string
  features: string[]
}

export interface ProfilePlansCopy {
  sectionTitle: string
  sectionDescription: string
  currentPlanLabel: string
  proStatus: string
  freeStatus: string
  plans: PlanCopy[]
}

const profilePlansCopyByLanguage: Record<Language, ProfilePlansCopy> = {
  pt: {
    sectionTitle: 'Planos',
    sectionDescription: 'Veja o que cada plano libera e o valor mensal.',
    currentPlanLabel: 'Plano atual',
    proStatus: 'Voce tem acesso a sincronizacao em nuvem.',
    freeStatus: 'No Free, seus dados ficam apenas no dispositivo local.',
    plans: [
      {
        code: 'free',
        title: 'Free',
        price: 'R$ 0/mes',
        features: ['Historico local no navegador', 'Chat e modo prova', 'Sem sincronizacao em nuvem'],
      },
      {
        code: 'pro',
        title: 'Pro',
        price: 'R$ 29/mes',
        features: ['Tudo do plano Free', 'Sincronizacao em nuvem', 'Continuidade entre dispositivos'],
      },
    ],
  },
  en: {
    sectionTitle: 'Plans',
    sectionDescription: 'See what each plan unlocks and monthly price.',
    currentPlanLabel: 'Current plan',
    proStatus: 'You have access to cloud sync.',
    freeStatus: 'On Free, your data stays only on local device.',
    plans: [
      {
        code: 'free',
        title: 'Free',
        price: '$0/month',
        features: ['Local history in browser', 'Chat and exam mode', 'No cloud sync'],
      },
      {
        code: 'pro',
        title: 'Pro',
        price: '$9/month',
        features: ['Everything in Free plan', 'Cloud sync', 'Continuity across devices'],
      },
    ],
  },
}

export function getProfilePlansCopy(language: Language) {
  return profilePlansCopyByLanguage[language]
}
