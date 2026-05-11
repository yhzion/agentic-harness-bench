import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import styles from './TodoFilter.module.css'
import { TodoFilter } from './TodoFilter'

describe('TodoFilter - 스타일 결합', () => {
  it('CSS Module이 .group, .tab, .tabActive를 export한다', () => {
    expect(styles.group).toBeTruthy()
    expect(styles.tab).toBeTruthy()
    expect(styles.tabActive).toBeTruthy()
  })

  it('group 컨테이너에 .group 클래스 적용', () => {
    const { container } = render(<TodoFilter value="all" onChange={vi.fn()} />)
    expect(container.querySelector(`.${styles.group}`)).not.toBeNull()
  })

  it('비활성 버튼에는 .tab만 적용', () => {
    render(<TodoFilter value="all" onChange={vi.fn()} />)
    const active = screen.getByRole('button', { name: /^(active|미완료)$/i })
    expect(active).toHaveClass(styles.tab)
    expect(active).not.toHaveClass(styles.tabActive)
  })

  it('활성 버튼에는 .tab과 .tabActive 둘 다 적용', () => {
    render(<TodoFilter value="active" onChange={vi.fn()} />)
    const active = screen.getByRole('button', { name: /^(active|미완료)$/i })
    expect(active).toHaveClass(styles.tab)
    expect(active).toHaveClass(styles.tabActive)
  })
})
