import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import type { Message } from '../../../types/chat'

function createOrderEntries(items: string[]) {
  const counts: Record<string, number> = {}

  return items.map((item) => {
    const nextCount = (counts[item] ?? 0) + 1
    counts[item] = nextCount

    return {
      id: `${item}__${nextCount}`,
      label: item,
    }
  })
}

function isSameOrder(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false
  }

  return left.every((item, index) => item === right[index])
}

function createInitialOrdering(items: string[], correctOrder: string[]) {
  if (items.length <= 1) {
    return items
  }

  const shuffled = [...items]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const current = shuffled[index]
    shuffled[index] = shuffled[swapIndex]
    shuffled[swapIndex] = current
  }

  if (!isSameOrder(shuffled, correctOrder)) {
    return shuffled
  }

  return [...shuffled.slice(1), shuffled[0]]
}

interface AssistantOrderingMessageProps {
  message: Message
  language: 'pt' | 'en'
  markdownComponents: Components
  markdownInlineComponents: Components
  orderingDrafts: Record<string, string[]>
  setOrderingDrafts: React.Dispatch<React.SetStateAction<Record<string, string[]>>>
  submitOrderingAnswer: (messageId: string, answer: string[]) => void
}

interface SortableOrderingItemProps {
  itemId: string
  index: number
  label: string
  disabled: boolean
  isCorrectPosition?: boolean
}

function SortableOrderingItem({
  itemId,
  index,
  label,
  disabled,
  isCorrectPosition,
}: SortableOrderingItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: itemId,
    disabled,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`rounded-[10px] border border-[color:var(--card-border)] bg-[color:var(--panel-bg)] px-2 py-2 text-sm text-[color:var(--text-soft)] transition-shadow duration-200 ${
        disabled ? '' : 'cursor-grab active:cursor-grabbing'
      } ${
        isDragging ? 'shadow-lg' : ''
      } ${
        isCorrectPosition === undefined
          ? ''
          : (isCorrectPosition
            ? 'border-emerald-500/60 bg-emerald-500/10'
            : 'border-rose-500/60 bg-rose-500/10')
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="font-['IBM_Plex_Mono'] text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--accent-soft)]">{index + 1}</span>
        <span className="flex-1 text-[color:var(--text-main)]">{label}</span>
        {!disabled ? <GripVertical className="h-4 w-4 text-[color:var(--text-soft)]" aria-hidden="true" /> : null}
      </div>
    </div>
  )
}

export function AssistantOrderingMessage({
  message,
  language,
  markdownComponents,
  markdownInlineComponents,
  orderingDrafts,
  setOrderingDrafts,
  submitOrderingAnswer,
}: AssistantOrderingMessageProps) {
  if (!message.ordering) {
    return null
  }

  const options = message.ordering.items
  const currentOrder = orderingDrafts[message.id] ?? createInitialOrdering(options, message.ordering.correctOrder)
  const submittedOrder = message.orderingAnswer ?? options
  const displayedOrder = message.orderingSubmitted ? submittedOrder : currentOrder
  const orderEntries = useMemo(() => createOrderEntries(displayedOrder), [displayedOrder])
  const correctOrder = message.ordering.correctOrder
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleDragEnd(event: DragEndEvent) {
    if (message.orderingSubmitted || !event.over || event.active.id === event.over.id) {
      return
    }

    const fromIndex = orderEntries.findIndex((entry) => entry.id === event.active.id)
    const toIndex = orderEntries.findIndex((entry) => entry.id === event.over?.id)

    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
      return
    }

    const next = arrayMove(currentOrder, fromIndex, toIndex)
    setOrderingDrafts((drafts) => ({ ...drafts, [message.id]: next }))
  }

  return (
    <div className="mt-2 rounded-[10px] border border-[color:var(--card-border)] bg-[color:var(--input-bg)] p-2">
      {message.ordering.topic ? (
        <p className="font-['IBM_Plex_Mono'] text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--accent-soft)]">
          {message.ordering.topic}
        </p>
      ) : null}
      <div className="mt-1 text-sm font-medium leading-6 text-[color:var(--text-main)]">
        <ReactMarkdown components={markdownComponents}>{message.ordering.question}</ReactMarkdown>
      </div>
      <div className="mt-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={orderEntries.map((entry) => entry.id)} strategy={verticalListSortingStrategy}>
            <div className="grid gap-2">
              {orderEntries.map((entry, index) => (
                <SortableOrderingItem
                  key={`${message.id}-${entry.id}`}
                  itemId={entry.id}
                  index={index}
                  label={entry.label}
                  disabled={Boolean(message.orderingSubmitted)}
                  isCorrectPosition={message.orderingSubmitted ? correctOrder[index] === entry.label : undefined}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
      {!message.orderingSubmitted ? (
        <button
          type="button"
          onClick={() => submitOrderingAnswer(message.id, currentOrder)}
          className="mt-2 rounded-[10px] border border-[color:var(--card-border)] px-3 py-2 text-xs text-[color:var(--text-main)]"
        >
          {language === 'pt' ? 'Verificar resposta' : 'Check answer'}
        </button>
      ) : null}
      {message.orderingSubmitted && message.ordering.explanation ? (
        <div className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">
          <ReactMarkdown components={markdownInlineComponents}>{message.ordering.explanation}</ReactMarkdown>
        </div>
      ) : null}
    </div>
  )
}
