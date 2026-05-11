import { describe, it, expectTypeOf } from 'vitest'
import type { Todo, TodoFilter, TodoCreateInput, TodoUpdateInput, ValidationResult } from './todo'

describe('Todo 타입 계약', () => {
  it('Todo는 id, title, completed, createdAt, updatedAt 필드를 가진다', () => {
    expectTypeOf<Todo>().toEqualTypeOf<{
      id: string
      title: string
      completed: boolean
      createdAt: number
      updatedAt: number
    }>()
  })

  it('TodoFilter는 all/active/completed 유니온이다', () => {
    expectTypeOf<TodoFilter>().toEqualTypeOf<'all' | 'active' | 'completed'>()
  })

  it('TodoCreateInput은 title만 가진다', () => {
    expectTypeOf<TodoCreateInput>().toEqualTypeOf<{ title: string }>()
  })

  it('TodoUpdateInput은 id, title을 가진다', () => {
    expectTypeOf<TodoUpdateInput>().toEqualTypeOf<{ id: string; title: string }>()
  })

  it('ValidationResult는 성공/실패 유니온이다', () => {
    expectTypeOf<ValidationResult>().toEqualTypeOf<
      { ok: true; value: string } | { ok: false; message: string }
    >()
  })
})
