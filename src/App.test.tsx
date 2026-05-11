import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from './App'
import { TODO_STORAGE_KEY } from './storage/todoStorage'

beforeEach(() => {
  localStorage.clear()
})

describe('App - 통합', () => {
  it('h1 "Todo"를 렌더링한다', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: /todo/i })).toBeInTheDocument()
  })

  it('TodoInput, TodoFilter, TodoList가 모두 렌더링된다', () => {
    render(<App />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^(all|전체)$/i })).toBeInTheDocument()
    expect(screen.getByRole('list')).toBeInTheDocument()
  })

  it('전체 워크플로우 — 추가 → 토글 → 필터 → 삭제', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByRole('textbox'), '우유 사기{Enter}')
    expect(screen.getByText('우유 사기')).toBeInTheDocument()

    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: /^(completed|완료)$/i }))
    expect(screen.getAllByRole('listitem')).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: /^(active|미완료)$/i }))
    expect(screen.queryByRole('listitem')).toBeNull()

    await user.click(screen.getByRole('button', { name: /^(all|전체)$/i }))
    await user.click(screen.getByRole('button', { name: /delete|삭제|remove/i }))
    expect(screen.queryByRole('listitem')).toBeNull()
  })

  it('localStorage에 영속화된다', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByRole('textbox'), '저장 확인{Enter}')
    expect(localStorage.getItem(TODO_STORAGE_KEY)).toContain('저장 확인')
  })
})
