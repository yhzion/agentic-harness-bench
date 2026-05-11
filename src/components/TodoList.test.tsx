import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TodoList } from './TodoList'
import type { Todo } from '../types/todo'

const sample: Todo[] = [
  { id: 'a', title: 'A', completed: false, createdAt: 1, updatedAt: 1 },
  { id: 'b', title: 'B', completed: true, createdAt: 2, updatedAt: 2 },
]

const noop = vi.fn()

describe('TodoList - 로직', () => {
  it('빈 배열일 때 안내 텍스트를 표시한다', () => {
    render(<TodoList todos={[]} onToggle={noop} onRemove={noop} onUpdateTitle={noop} />)
    expect(screen.getByText(/할\s*일|empty|no/i)).toBeInTheDocument()
  })

  it('각 항목을 list 역할로 렌더링한다', () => {
    render(<TodoList todos={sample} onToggle={noop} onRemove={noop} onUpdateTitle={noop} />)
    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('각 Todo의 title을 표시한다', () => {
    render(<TodoList todos={sample} onToggle={noop} onRemove={noop} onUpdateTitle={noop} />)
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
  })
})
