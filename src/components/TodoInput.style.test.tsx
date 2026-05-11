import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import styles from './TodoInput.module.css'
import { TodoInput } from './TodoInput'

describe('TodoInput - 스타일 결합', () => {
  it('CSS Module은 .input과 .buttonPrimary 클래스를 export한다', () => {
    expect(styles.input).toBeTruthy()
    expect(styles.buttonPrimary).toBeTruthy()
  })

  it('CSS Module은 .form 클래스를 export한다 (form 컨테이너)', () => {
    expect(styles.form).toBeTruthy()
  })

  it('input 요소에 .input 클래스가 적용된다', () => {
    render(<TodoInput onAdd={vi.fn()} />)
    expect(screen.getByRole('textbox')).toHaveClass(styles.input)
  })

  it('button 요소에 .buttonPrimary 클래스가 적용된다', () => {
    render(<TodoInput onAdd={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveClass(styles.buttonPrimary)
  })
})
