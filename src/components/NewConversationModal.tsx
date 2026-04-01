interface NewConversationModalProps {
  language: 'pt' | 'en'
  isOpen: boolean
  mode: 'chat' | 'exam'
  topic: string
  examProfile: 'general' | 'enem'
  examFlow: 'single' | 'passage'
  difficulty: 'auto' | 'easy' | 'medium' | 'hard'
  conversationModeLabel: Record<'pt' | 'en', Record<'chat' | 'exam', string>>
  examProfileLabel: Record<'pt' | 'en', Record<'general' | 'enem', string>>
  examFlowLabel: Record<'pt' | 'en', Record<'single' | 'passage', string>>
  difficultyLabel: Record<'pt' | 'en', Record<'auto' | 'easy' | 'medium' | 'hard', string>>
  onModeChange: (value: 'chat' | 'exam') => void
  onTopicChange: (value: string) => void
  onExamProfileChange: (value: 'general' | 'enem') => void
  onExamFlowChange: (value: 'single' | 'passage') => void
  onDifficultyChange: (value: 'auto' | 'easy' | 'medium' | 'hard') => void
  onCancel: () => void
  onCreate: () => void
}

export function NewConversationModal({
  language,
  isOpen,
  mode,
  topic,
  examProfile,
  examFlow,
  difficulty,
  conversationModeLabel,
  examProfileLabel,
  examFlowLabel,
  difficultyLabel,
  onModeChange,
  onTopicChange,
  onExamProfileChange,
  onExamFlowChange,
  onDifficultyChange,
  onCancel,
  onCreate,
}: NewConversationModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3">
      <div className="glass-panel w-full max-w-xl rounded-[10px] p-3">
        <h2 className="font-['Space_Grotesk'] text-[1.25rem] font-bold text-[color:var(--text-main)]">
          {language === 'pt' ? 'Nova conversa' : 'New conversation'}
        </h2>
        <p className="mt-1 text-sm text-[color:var(--text-muted)]">
          {language === 'pt'
            ? 'No modo prova, voce pode escolher perfil, formato e dificuldade. O assunto e opcional.'
            : 'In exam mode, you can choose profile, format, and difficulty. Topic is optional.'}
        </p>

        <div className="mt-3 grid gap-2">
          <label className="text-xs uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
            {language === 'pt' ? 'Tipo de conversa' : 'Conversation type'}
          </label>
          <select
            value={mode}
            onChange={(event) => onModeChange(event.target.value as 'chat' | 'exam')}
            className="rounded-[10px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] px-3 py-2 text-sm text-[color:var(--text-main)] outline-none"
          >
            {(['chat', 'exam'] as const).map((currentMode) => (
              <option key={currentMode} value={currentMode}>{conversationModeLabel[language][currentMode]}</option>
            ))}
          </select>
        </div>

        <div className="mt-3 grid gap-2">
          <label className="text-xs uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
            {language === 'pt' ? 'Assunto da prova (opcional)' : 'Exam topic (optional)'}
          </label>
          <input
            value={topic}
            onChange={(event) => onTopicChange(event.target.value)}
            placeholder={language === 'pt' ? 'Ex.: Historia de Portugal' : 'e.g. History of Portugal'}
            className="rounded-[10px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] px-3 py-2 text-sm text-[color:var(--text-main)] outline-none"
          />
        </div>

        <div className="mt-3 grid gap-2">
          <label className="text-xs uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
            {language === 'pt' ? 'Perfil da prova' : 'Exam profile'}
          </label>
          <select
            value={examProfile}
            onChange={(event) => onExamProfileChange(event.target.value as 'general' | 'enem')}
            disabled={mode !== 'exam'}
            className="rounded-[10px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] px-3 py-2 text-sm text-[color:var(--text-main)] outline-none disabled:opacity-60"
          >
            {(['general', 'enem'] as const).map((profile) => (
              <option key={profile} value={profile}>{examProfileLabel[language][profile]}</option>
            ))}
          </select>
        </div>

        <div className="mt-3 grid gap-2">
          <label className="text-xs uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
            {language === 'pt' ? 'Formato da prova' : 'Exam format'}
          </label>
          <select
            value={examFlow}
            onChange={(event) => onExamFlowChange(event.target.value as 'single' | 'passage')}
            disabled={mode !== 'exam'}
            className="rounded-[10px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] px-3 py-2 text-sm text-[color:var(--text-main)] outline-none disabled:opacity-60"
          >
            {(['single', 'passage'] as const).map((flow) => (
              <option key={flow} value={flow}>{examFlowLabel[language][flow]}</option>
            ))}
          </select>
        </div>

        <div className="mt-3 grid gap-2">
          <label className="text-xs uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
            {language === 'pt' ? 'Dificuldade' : 'Difficulty'}
          </label>
          <select
            value={difficulty}
            onChange={(event) => onDifficultyChange(event.target.value as 'auto' | 'easy' | 'medium' | 'hard')}
            disabled={mode !== 'exam'}
            className="rounded-[10px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] px-3 py-2 text-sm text-[color:var(--text-main)] outline-none disabled:opacity-60"
          >
            {(['auto', 'easy', 'medium', 'hard'] as const).map((level) => (
              <option key={level} value={level}>{difficultyLabel[language][level]}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-[color:var(--card-border)] px-3 py-2 text-sm text-[color:var(--text-main)]"
          >
            {language === 'pt' ? 'Cancelar' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={onCreate}
            className="accent-button rounded-full px-3 py-2 text-sm font-semibold text-white"
          >
            {language === 'pt' ? 'Criar conversa' : 'Create conversation'}
          </button>
        </div>
      </div>
    </div>
  )
}
