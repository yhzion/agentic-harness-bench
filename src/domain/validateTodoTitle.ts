import type { ValidationResult } from '../types/todo'

export function validateTodoTitle(input: string): ValidationResult {
  const trimmed = input.trim()
  if (trimmed === '') {
    return { ok: false, message: 'EMPTY' }
  }
  if (trimmed.length > 200) {
    return { ok: false, message: 'TOO_LONG' }
  }
  return { ok: true, value: trimmed }
}

export const TODO_TITLE_MAX_LENGTH = 200
