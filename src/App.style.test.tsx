import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { App } from './App'
import styles from './App.module.css'

describe('App Shell - 스타일 결합', () => {
  it('CSS Module이 .hero, .container, .body, .footer를 export한다', () => {
    expect(styles.hero).toBeTruthy()
    expect(styles.container).toBeTruthy()
    expect(styles.body).toBeTruthy()
    expect(styles.footer).toBeTruthy()
  })

  it('h1이 .hero 컨테이너 내부에 있다', () => {
    render(<App />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.closest(`.${styles.hero}`)).not.toBeNull()
  })

  it('contentinfo(footer) 역할 요소가 .footer 클래스를 가진다', () => {
    render(<App />)
    expect(screen.getByRole('contentinfo')).toHaveClass(styles.footer)
  })
})
