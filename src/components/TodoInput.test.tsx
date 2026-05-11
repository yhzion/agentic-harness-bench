import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoInput } from './TodoInput'

describe('TodoInput - 로직', () => {
  it('input과 button을 렌더링한다', () => {
    render(<TodoInput onAdd={vi.fn()} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('input에 접근 가능한 이름이 있다 (aria-label 또는 label)', () => {
    render(<TodoInput onAdd={vi.fn()} />)
    expect(screen.getByRole('textbox')).toHaveAccessibleName()
  })

  it('button 클릭 시 onAdd가 호출된다', async () => {
    const onAdd = vi.fn()
    const user = userEvent.setup()
    render(<TodoInput onAdd={onAdd} />)
    await user.type(screen.getByRole('textbox'), '우유 사기')
    await user.click(screen.getByRole('button'))
    expect(onAdd).toHaveBeenCalledWith('우유 사기')
  })

  it('Enter 키로도 onAdd가 호출된다', async () => {
    const onAdd = vi.fn()
    const user = userEvent.setup()
    render(<TodoInput onAdd={onAdd} />)
    await user.type(screen.getByRole('textbox'), '우유{Enter}')
    expect(onAdd).toHaveBeenCalledWith('우유')
  })

  it('제출 후 입력값은 초기화된다', async () => {
    const user = userEvent.setup()
    render(<TodoInput onAdd={vi.fn()} />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    await user.type(input, '우유{Enter}')
    expect(input.value).toBe('')
  })

  it('빈 또는 공백만 입력은 onAdd를 호출하지 않는다', async () => {
    const onAdd = vi.fn()
    const user = userEvent.setup()
    render(<TodoInput onAdd={onAdd} />)
    await user.click(screen.getByRole('button'))
    expect(onAdd).not.toHaveBeenCalled()
    await user.type(screen.getByRole('textbox'), '   {Enter}')
    expect(onAdd).not.toHaveBeenCalled()
  })
})
