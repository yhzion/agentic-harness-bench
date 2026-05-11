import type { Todo } from '../types/todo'

function isTodo(item: unknown): item is Todo {
  if (typeof item !== 'object' || item === null || Array.isArray(item)) {
    return false
  }
  return (
    'id' in item &&
    typeof (item as Todo).id === 'string' &&
    'title' in item &&
    typeof (item as Todo).title === 'string' &&
    'completed' in item &&
    typeof (item as Todo).completed === 'boolean' &&
    'createdAt' in item &&
    typeof (item as Todo).createdAt === 'number' &&
    'updatedAt' in item &&
    typeof (item as Todo).updatedAt === 'number'
  )
}

export function deserializeTodos(value: string): Todo[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isTodo)
  } catch {
    return []
  }
}
