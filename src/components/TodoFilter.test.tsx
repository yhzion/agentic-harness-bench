import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoFilter } from './TodoFilter'

describe('TodoFilter - 로직', () => {
  it('all/active/completed 세 버튼을 렌더링한다', () => {
    render(<TodoFilter value="all" onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /^(all|전체)$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^(active|미완료)$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^(completed|완료)$/i })).toBeInTheDocument()
  })

  it('현재 value 버튼은 aria-pressed=true', () => {
    render(<TodoFilter value="active" onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /^(active|미완료)$/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: /^(all|전체)$/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('버튼 클릭 시 onChange 호출', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<TodoFilter value="all" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: /^(completed|완료)$/i }))
    expect(onChange).toHaveBeenCalledWith('completed')
  })
})
