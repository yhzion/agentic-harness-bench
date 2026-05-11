import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import styles from './TodoItem.module.css'
import { TodoItem } from './TodoItem'
import type { Todo } from '../types/todo'

const make = (overrides: Partial<Todo> = {}): Todo => ({
  id: 'a',
  title: 'Sample',
  completed: false,
  createdAt: 1,
  updatedAt: 1,
  ...overrides,
})

describe('TodoItem - 스타일 결합', () => {
  it('CSS Module이 .row, .checkbox, .title, .titleCompleted, .removeButton, .editInput를 export', () => {
    expect(styles.row).toBeTruthy()
    expect(styles.checkbox).toBeTruthy()
    expect(styles.title).toBeTruthy()
    expect(styles.titleCompleted).toBeTruthy()
    expect(styles.removeButton).toBeTruthy()
    expect(styles.editInput).toBeTruthy()
  })

  it('미완료 title에 .title 클래스가 적용된다', () => {
    render(<TodoItem todo={make()} onToggle={vi.fn()} onRemove={vi.fn()} onUpdateTitle={vi.fn()} />)
    expect(screen.getByText('Sample')).toHaveClass(styles.title)
  })

  it('완료된 title에 .titleCompleted 클래스가 추가된다', () => {
    render(
      <TodoItem
        todo={make({ completed: true })}
        onToggle={vi.fn()}
        onRemove={vi.fn()}
        onUpdateTitle={vi.fn()}
      />,
    )
    expect(screen.getByText('Sample')).toHaveClass(styles.titleCompleted)
  })

  it('removeButton에 .removeButton 클래스가 적용된다', () => {
    render(<TodoItem todo={make()} onToggle={vi.fn()} onRemove={vi.fn()} onUpdateTitle={vi.fn()} />)
    expect(screen.getByRole('button', { name: /delete|삭제|remove/i })).toHaveClass(
      styles.removeButton,
    )
  })
})
