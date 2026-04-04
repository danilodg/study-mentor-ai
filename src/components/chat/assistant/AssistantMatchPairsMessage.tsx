import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import type { Message } from '../../../types/chat'

interface MatchLine {
  x1: number
  y1: number
  x2: number
  y2: number
  isCorrect?: boolean
}

function createShuffledRights(values: string[], seedText: string) {
  const shuffled = [...values]
  let seed = 0

  for (let index = 0; index < seedText.length; index += 1) {
    seed = ((seed * 31) + seedText.charCodeAt(index)) >>> 0
  }

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    seed = ((seed * 1664525) + 1013904223) >>> 0
    const swapIndex = seed % (index + 1)
    const current = shuffled[index]
    shuffled[index] = shuffled[swapIndex]
    shuffled[swapIndex] = current
  }

  return shuffled
}

interface AssistantMatchPairsMessageProps {
  message: Message
  language: 'pt' | 'en'
  markdownComponents: Components
  markdownInlineComponents: Components
  matchDrafts: Record<string, Record<string, string>>
  setMatchDrafts: React.Dispatch<React.SetStateAction<Record<string, Record<string, string>>>>
  submitMatchPairsAnswer: (messageId: string, answer: Record<string, string>) => void
}

export function AssistantMatchPairsMessage({
  message,
  language,
  markdownComponents,
  markdownInlineComponents,
  matchDrafts,
  setMatchDrafts,
  submitMatchPairsAnswer,
}: AssistantMatchPairsMessageProps) {
  const [activeLeft, setActiveLeft] = useState<string | null>(null)
  const [lines, setLines] = useState<MatchLine[]>([])
  const boardRef = useRef<HTMLDivElement | null>(null)
  const leftRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const rightRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  if (!message.matchPairs) {
    return null
  }

  const matchPairs = message.matchPairs

  const pairMap = useMemo(
    () => new Map(matchPairs.pairs.map((pair) => [pair.left, pair.right])),
    [matchPairs.pairs],
  )
  const draftAnswer = matchDrafts[message.id]
  const answerMap = message.matchPairsSubmitted ? message.matchPairsAnswer : draftAnswer
  const answerEntries = useMemo(() => Object.entries(answerMap ?? {}), [answerMap])
  const rightItems = useMemo(() => {
    const allRights = matchPairs.pairs.map((pair) => pair.right)
    return createShuffledRights(allRights, message.id)
  }, [message.id, matchPairs.pairs])

  useEffect(() => {
    if (message.matchPairsSubmitted) {
      setActiveLeft(null)
    }
  }, [message.matchPairsSubmitted])

  useLayoutEffect(() => {
    function updateLines() {
      const board = boardRef.current

      if (!board) {
        setLines([])
        return
      }

      const boardRect = board.getBoundingClientRect()
      const nextLines = answerEntries.flatMap(([left, right]) => {
        const leftElement = leftRefs.current[left]
        const rightElement = rightRefs.current[right]

        if (!leftElement || !rightElement) {
          return []
        }

        const leftRect = leftElement.getBoundingClientRect()
        const rightRect = rightElement.getBoundingClientRect()
        const expectedRight = pairMap.get(left)

        return [{
          x1: leftRect.right - boardRect.left,
          y1: (leftRect.top + (leftRect.height / 2)) - boardRect.top,
          x2: rightRect.left - boardRect.left,
          y2: (rightRect.top + (rightRect.height / 2)) - boardRect.top,
          isCorrect: message.matchPairsSubmitted ? expectedRight === right : undefined,
        }]
      })

      setLines(nextLines)
    }

    updateLines()
    window.addEventListener('resize', updateLines)

    return () => window.removeEventListener('resize', updateLines)
  }, [answerEntries, message.matchPairsSubmitted, pairMap, rightItems])

  function assignRightToActiveLeft(right: string) {
    if (!activeLeft || message.matchPairsSubmitted) {
      return
    }

    setMatchDrafts((drafts) => {
      const current = drafts[message.id] ?? {}
      const next: Record<string, string> = { ...current }

      Object.entries(next).forEach(([leftKey, value]) => {
        if (leftKey !== activeLeft && value === right) {
          delete next[leftKey]
        }
      })

      next[activeLeft] = right

      return {
        ...drafts,
        [message.id]: next,
      }
    })

    setActiveLeft(null)
  }

  return (
    <div className="mt-2 rounded-[10px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] p-2">
      {message.matchPairs.topic ? (
        <p className="font-['IBM_Plex_Mono'] text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--accent-soft)]">
          {message.matchPairs.topic}
        </p>
      ) : null}
      <div className="mt-1 text-sm font-medium leading-6 text-[color:var(--text-main)]">
        <ReactMarkdown components={markdownComponents}>{message.matchPairs.prompt}</ReactMarkdown>
      </div>
      <div ref={boardRef} className="relative mt-2">
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
          {lines.map((line, index) => (
            <line
              key={`${message.id}-line-${index}`}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={line.isCorrect === undefined
                ? 'var(--accent-soft)'
                : (line.isCorrect ? 'rgb(52 211 153)' : 'rgb(251 113 133)')}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          ))}
        </svg>
        <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6">
          <div className="grid gap-2">
            {(message.matchPairs?.pairs ?? []).map((pair) => {
              const selectedRight = answerMap?.[pair.left]
              const expectedRight = pairMap.get(pair.left)
              const isCorrect = selectedRight !== undefined && selectedRight === expectedRight
              const isWrong = selectedRight !== undefined && selectedRight !== expectedRight

              return (
                <button
                  key={`${message.id}-left-${pair.left}`}
                  type="button"
                  ref={(element) => {
                    leftRefs.current[pair.left] = element
                  }}
                  onClick={() => {
                    if (message.matchPairsSubmitted) {
                      return
                    }

                    setActiveLeft((current) => (current === pair.left ? null : pair.left))
                  }}
                  disabled={message.matchPairsSubmitted}
                  className={`rounded-[10px] border px-2 py-2 text-left text-sm transition ${
                    message.matchPairsSubmitted
                      ? (isCorrect
                        ? 'border-emerald-500/60 bg-emerald-500/10 text-[color:var(--text-main)]'
                        : (isWrong
                          ? 'border-rose-500/60 bg-rose-500/10 text-[color:var(--text-main)]'
                          : 'border-[color:var(--card-border)] text-[color:var(--text-main)]'))
                      : (activeLeft === pair.left
                        ? 'border-[color:var(--accent-soft)] bg-[color:var(--panel-bg)] text-[color:var(--text-main)]'
                        : 'border-[color:var(--card-border)] text-[color:var(--text-main)] hover:-translate-y-0.5')
                  }`}
                >
                  <span className="font-medium">{pair.left}</span>
                </button>
              )
            })}
          </div>
          <div className="grid gap-2">
            {rightItems.map((right) => {
              const connectedLeft = answerEntries.find(([, value]) => value === right)?.[0]

              return (
                <button
                  key={`${message.id}-right-${right}`}
                  type="button"
                  ref={(element) => {
                    rightRefs.current[right] = element
                  }}
                  onClick={() => assignRightToActiveLeft(right)}
                  disabled={message.matchPairsSubmitted}
                  className={`rounded-[10px] border px-2 py-2 text-left text-sm transition ${
                    message.matchPairsSubmitted
                      ? 'border-[color:var(--card-border)] text-[color:var(--text-main)] opacity-85'
                      : (connectedLeft
                        ? 'border-[color:var(--accent-soft)] bg-[color:var(--panel-bg)] text-[color:var(--text-main)]'
                        : 'border-[color:var(--card-border)] text-[color:var(--text-main)] hover:-translate-y-0.5')
                  }`}
                >
                  {right}
                </button>
              )
            })}
          </div>
        </div>
      </div>
      {!message.matchPairsSubmitted ? (
        <button
          type="button"
          onClick={() => submitMatchPairsAnswer(message.id, draftAnswer ?? {})}
          disabled={Object.keys(draftAnswer ?? {}).length < message.matchPairs.pairs.length}
          className="mt-2 rounded-[10px] border border-[color:var(--card-border)] px-3 py-2 text-xs text-[color:var(--text-main)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {language === 'pt' ? 'Verificar resposta' : 'Check answer'}
        </button>
      ) : null}
      {message.matchPairsSubmitted && message.matchPairs.explanation ? (
        <div className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">
          <ReactMarkdown components={markdownInlineComponents}>{message.matchPairs.explanation}</ReactMarkdown>
        </div>
      ) : null}
    </div>
  )
}
