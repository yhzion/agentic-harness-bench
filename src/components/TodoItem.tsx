import { useState, type JSX } from 'react'
import type { Todo } from '../types/todo'
import styles from './TodoItem.module.css'

export type TodoItemProps = {
  todo: Todo
  onToggle: (id: string) => void
  onRemove: (id: string) => void
  onUpdateTitle: (id: string, title: string) => void
  className?: string
}

export function TodoItem(props: TodoItemProps): JSX.Element {
  const { todo, onToggle, onRemove, onUpdateTitle, className } = props
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)

  const handleCheckboxChange = () => {
    onToggle(todo.id)
  }

  const handleRemove = () => {
    onRemove(todo.id)
  }

  const handleDblClick = () => {
    setEditing(true)
    setEditTitle(todo.title)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const trimmed = editTitle.trim()
      if (trimmed) {
        onUpdateTitle(todo.id, trimmed)
      }
      setEditing(false)
    } else if (e.key === 'Escape') {
      setEditing(false)
      setEditTitle(todo.title)
    }
  }

  return (
    <li className={`${styles.row}${className ? ' ' + className : ''}`}>
      <input
        className={styles.checkbox}
        type="checkbox"
        checked={todo.completed}
        onChange={handleCheckboxChange}
        aria-label={`완료: ${todo.title}`}
      />
      {editing ? (
        <input
          className={styles.editInput}
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="제목 수정"
        />
      ) : (
        <span
          className={todo.completed ? styles.titleCompleted : styles.title}
          onDoubleClick={handleDblClick}
        >
          {todo.title}
        </span>
      )}
      <button className={styles.removeButton} onClick={handleRemove}>
        Delete
      </button>
    </li>
  )
}
