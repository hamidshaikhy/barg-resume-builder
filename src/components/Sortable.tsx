import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
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
import { cx } from '@/lib/text'

export type HandleProps = HTMLAttributes<HTMLButtonElement> & { ref: (el: HTMLElement | null) => void }

function Row({
  id,
  children,
}: {
  id: string
  children: (handle: HandleProps, dragging: boolean) => ReactNode
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    position: 'relative',
  }
  const handle = { ...attributes, ...listeners, ref: setActivatorNodeRef } as unknown as HandleProps
  return (
    <div ref={setNodeRef} style={style}>
      {children(handle, isDragging)}
    </div>
  )
}

/** فهرست عمودی قابل جابه‌جایی با ماوس، لمس و صفحه‌کلید. */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  children,
  className,
}: {
  items: T[]
  onReorder: (ids: string[]) => void
  children: (item: T, handle: HandleProps, dragging: boolean) => ReactNode
  className?: string
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const ids = items.map((i) => i.id)
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const from = ids.indexOf(String(active.id))
    const to = ids.indexOf(String(over.id))
    if (from < 0 || to < 0) return
    onReorder(arrayMove(ids, from, to))
  }
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className={className}>
          {items.map((item) => (
            <Row key={item.id} id={item.id}>
              {(handle, dragging) => children(item, handle, dragging)}
            </Row>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

export function DragHandle({ handle, label }: { handle: HandleProps; label: string }) {
  const { ref, ...rest } = handle
  return (
    <button
      type="button"
      ref={ref}
      aria-label={label}
      title={label}
      className={cx(
        'inline-flex h-8 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded text-faint hover:bg-paper hover:text-ink active:cursor-grabbing',
      )}
      {...rest}
    >
      <GripVertical className="size-4" />
    </button>
  )
}
