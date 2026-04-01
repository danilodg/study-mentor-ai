import type { ReactNode } from 'react'
import type { Components } from 'react-markdown'

export const markdownComponents: Components = {
  h1: ({ children }: { children?: ReactNode }) => <h3 className="mt-4 text-base font-semibold text-[color:var(--text-main)] first:mt-0">{children}</h3>,
  h2: ({ children }: { children?: ReactNode }) => <h3 className="mt-4 text-base font-semibold text-[color:var(--text-main)] first:mt-0">{children}</h3>,
  h3: ({ children }: { children?: ReactNode }) => <h4 className="mt-4 text-sm font-semibold uppercase tracking-[0.08em] text-[color:var(--accent-soft)] first:mt-0">{children}</h4>,
  p: ({ children }: { children?: ReactNode }) => <p className="mt-2 first:mt-0">{children}</p>,
  ul: ({ children }: { children?: ReactNode }) => <ul className="mt-2 list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }: { children?: ReactNode }) => <ol className="mt-2 list-decimal space-y-1 pl-5">{children}</ol>,
  li: ({ children }: { children?: ReactNode }) => <li>{children}</li>,
  strong: ({ children }: { children?: ReactNode }) => <strong className="font-semibold text-[color:var(--text-main)]">{children}</strong>,
  em: ({ children }: { children?: ReactNode }) => <em className="italic">{children}</em>,
  code: ({ children }: { children?: ReactNode }) => <code className="rounded bg-[color:var(--input-bg)] px-1.5 py-0.5 font-['IBM_Plex_Mono'] text-[0.85em] text-[color:var(--text-main)]">{children}</code>,
}

export const markdownInlineComponents: Components = {
  p: ({ children }: { children?: ReactNode }) => <>{children}</>,
  strong: ({ children }: { children?: ReactNode }) => <strong className="font-semibold text-[color:var(--text-main)]">{children}</strong>,
  em: ({ children }: { children?: ReactNode }) => <em className="italic">{children}</em>,
  code: ({ children }: { children?: ReactNode }) => <code className="rounded bg-[color:var(--input-bg)] px-1.5 py-0.5 font-['IBM_Plex_Mono'] text-[0.85em] text-[color:var(--text-main)]">{children}</code>,
}
