import type { ResponseMode } from '../../../types/chat'

interface AssistantSkeletonProps {
  mode: ResponseMode | 'exam'
}

export function AssistantSkeleton({ mode }: AssistantSkeletonProps) {
  const lineClass = 'h-3 animate-pulse rounded-full bg-[color:var(--card-border)]'
  const buttonClass = 'flex h-9 w-full items-center rounded-[10px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] px-2'
  const buttonLineClass = 'h-2.5 animate-pulse rounded-full bg-[color:var(--card-border)]'

  function renderButtonSkeleton(widthClass: string) {
    return (
      <div className={buttonClass}>
        <div className={`${buttonLineClass} ${widthClass}`} />
      </div>
    )
  }

  if (mode === 'exam' || mode === 'quiz_mcq') {
    return (
      <div className="mt-2 space-y-2">
        <div className={`${lineClass} w-4/5`} />
        <div className={`${lineClass} w-3/5`} />
        <div className={`${lineClass} w-5/6`} />
        <div className="mt-3 grid gap-2">
          {renderButtonSkeleton('w-11/12')}
          {renderButtonSkeleton('w-10/12')}
          {renderButtonSkeleton('w-9/12')}
          {renderButtonSkeleton('w-8/12')}
        </div>
      </div>
    )
  }

  if (mode === 'true_false') {
    return (
      <div className="mt-2 space-y-2">
        <div className={`${lineClass} w-4/5`} />
        <div className={`${lineClass} w-2/3`} />
        <div className={`${lineClass} w-3/4`} />
        <div className="mt-3 grid grid-cols-2 gap-2">
          {renderButtonSkeleton('w-4/5')}
          {renderButtonSkeleton('w-4/5')}
        </div>
      </div>
    )
  }

  if (mode === 'short_answer') {
    return (
      <div className="mt-2 space-y-2">
        <div className={`${lineClass} w-5/6`} />
        <div className={`${lineClass} w-3/4`} />
        <div className="mt-3 h-20 w-full animate-pulse rounded-[10px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)]" />
      </div>
    )
  }

  if (mode === 'ordering') {
    return (
      <div className="mt-2 space-y-2">
        <div className={`${lineClass} w-4/5`} />
        <div className={`${lineClass} w-3/5`} />
        <div className={`${lineClass} w-4/6`} />
        <div className="mt-3 grid gap-2">
          {renderButtonSkeleton('w-10/12')}
          {renderButtonSkeleton('w-7/12')}
          {renderButtonSkeleton('w-9/12')}
          {renderButtonSkeleton('w-8/12')}
        </div>
      </div>
    )
  }

  if (mode === 'match_pairs') {
    return (
      <div className="mt-2 space-y-2">
        <div className={`${lineClass} w-4/5`} />
        <div className={`${lineClass} w-2/3`} />
        <div className={`${lineClass} w-5/6`} />
        <div className="mt-3 grid gap-2">
          {renderButtonSkeleton('w-10/12')}
          {renderButtonSkeleton('w-8/12')}
          {renderButtonSkeleton('w-9/12')}
        </div>
      </div>
    )
  }

  if (mode === 'cloze') {
    return (
      <div className="mt-2 space-y-2">
        <div className={`${lineClass} w-11/12`} />
        <div className={`${lineClass} w-8/12`} />
        <div className={`${lineClass} w-9/12`} />
        <div className="mt-3 flex gap-2">
          <div className="h-8 w-24 animate-pulse rounded-[10px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)]" />
          <div className="h-8 w-24 animate-pulse rounded-[10px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)]" />
          <div className="h-8 w-24 animate-pulse rounded-[10px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)]" />
        </div>
      </div>
    )
  }

  return (
    <div className="mt-2 space-y-2">
      <div className={`${lineClass} w-3/4`} />
      <div className={`${lineClass} w-full`} />
      <div className={`${lineClass} w-2/3`} />
    </div>
  )
}
