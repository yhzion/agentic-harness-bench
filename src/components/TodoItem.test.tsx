import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

describe('TodoItem - 로직', () => {
  it('checkbox와 title을 렌더링한다', () => {
    render(<TodoItem todo={make()} onToggle={vi.fn()} onRemove={vi.fn()} onUpdateTitle={vi.fn()} />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
    expect(screen.getByText('Sample')).toBeInTheDocument()
  })

  it('checkbox는 completed 상태를 반영한다', () => {
    render(
      <TodoItem
        todo={make({ completed: true })}
        onToggle={vi.fn()}
        onRemove={vi.fn()}
        onUpdateTitle={vi.fn()}
      />,
    )
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('checkbox 클릭 시 onToggle(id) 호출', async () => {
    const onToggle = vi.fn()
    const user = userEvent.setup()
    render(
      <TodoItem todo={make()} onToggle={onToggle} onRemove={vi.fn()} onUpdateTitle={vi.fn()} />,
    )
    await user.click(screen.getByRole('checkbox'))
    expect(onToggle).toHaveBeenCalledWith('a')
  })

  it('삭제 버튼 클릭 시 onRemove(id) 호출', async () => {
    const onRemove = vi.fn()
    const user = userEvent.setup()
    render(
      <TodoItem todo={make()} onToggle={vi.fn()} onRemove={onRemove} onUpdateTitle={vi.fn()} />,
    )
    await user.click(screen.getByRole('button', { name: /delete|삭제|remove/i }))
    expect(onRemove).toHaveBeenCalledWith('a')
  })

  it('title을 더블클릭하면 편집 모드로 진입한다', async () => {
    const user = userEvent.setup()
    render(<TodoItem todo={make()} onToggle={vi.fn()} onRemove={vi.fn()} onUpdateTitle={vi.fn()} />)
    await user.dblClick(screen.getByText('Sample'))
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('편집 후 Enter로 onUpdateTitle 호출', async () => {
    const onUpdateTitle = vi.fn()
    const user = userEvent.setup()
    render(
      <TodoItem
        todo={make()}
        onToggle={vi.fn()}
        onRemove={vi.fn()}
        onUpdateTitle={onUpdateTitle}
      />,
    )
    await user.dblClick(screen.getByText('Sample'))
    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, '새 제목{Enter}')
    expect(onUpdateTitle).toHaveBeenCalledWith('a', '새 제목')
  })
})
