import { useState, FormEvent, ChangeEvent, type JSX } from 'react'
import styles from './TodoInput.module.css'

export type TodoInputProps = {
  onAdd: (title: string) => void
}

export function TodoInput(props: TodoInputProps): JSX.Element {
  const [text, setText] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    props.onAdd(trimmed)
    setText('')
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        type="text"
        aria-label="새 할 일"
        value={text}
        onChange={handleChange}
      />
      <button className={styles.buttonPrimary} type="submit">
        추가
      </button>
    </form>
  )
}
