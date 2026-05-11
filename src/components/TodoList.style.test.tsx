import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import styles from './TodoList.module.css'
import { TodoList } from './TodoList'
import type { Todo } from '../types/todo'

const sample: Todo[] = [{ id: 'a', title: 'A', completed: false, createdAt: 1, updatedAt: 1 }]
const noop = vi.fn()

describe('TodoList - 스타일 결합', () => {
  it('CSS Module이 .list, .item, .empty 클래스를 export한다', () => {
    expect(styles.list).toBeTruthy()
    expect(styles.item).toBeTruthy()
    expect(styles.empty).toBeTruthy()
  })

  it('ul에 .list 클래스가 적용된다', () => {
    render(<TodoList todos={sample} onToggle={noop} onRemove={noop} onUpdateTitle={noop} />)
    expect(screen.getByRole('list')).toHaveClass(styles.list)
  })

  it('각 li에 .item 클래스가 적용된다', () => {
    render(<TodoList todos={sample} onToggle={noop} onRemove={noop} onUpdateTitle={noop} />)
    expect(screen.getByRole('listitem')).toHaveClass(styles.item)
  })

  it('빈 상태 컨테이너에 .empty 클래스가 적용된다', () => {
    const { container } = render(
      <TodoList todos={[]} onToggle={noop} onRemove={noop} onUpdateTitle={noop} />,
    )
    expect(container.querySelector(`.${styles.empty}`)).not.toBeNull()
  })
})
