import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { App } from './App'
import { TODO_STORAGE_KEY } from './storage/todoStorage'

expect.extend(toHaveNoViolations)

beforeEach(() => {
  localStorage.clear()
})

describe('App - 접근성 (axe-core)', () => {
  it('빈 상태에서 axe violations가 0건', async () => {
    const { container } = render(<App />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('데이터가 있는 상태에서 axe violations가 0건', async () => {
    localStorage.setItem(
      TODO_STORAGE_KEY,
      JSON.stringify([
        { id: 'a', title: '우유 사기', completed: false, createdAt: 1, updatedAt: 1 },
        { id: 'b', title: '운동', completed: true, createdAt: 2, updatedAt: 2 },
        { id: 'c', title: '책 읽기', completed: false, createdAt: 3, updatedAt: 3 },
      ]),
    )
    const { container } = render(<App />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
