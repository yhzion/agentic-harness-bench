import type { JSX } from 'react'
import type { Todo } from '../types/todo'
import { TodoItem } from './TodoItem'
import styles from './TodoList.module.css'

export type TodoListProps = {
  todos: readonly Todo[]
  onToggle: (id: string) => void
  onRemove: (id: string) => void
  onUpdateTitle: (id: string, title: string) => void
}

export function TodoList(props: TodoListProps): JSX.Element {
  const { todos, onToggle, onRemove, onUpdateTitle } = props

  return (
    <div>
      {todos.length === 0 && <p className={styles.empty}>할 일이 없습니다</p>}
      <ul className={styles.list}>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onRemove={onRemove}
            onUpdateTitle={onUpdateTitle}
            className={styles.item}
          />
        ))}
      </ul>
    </div>
  )
}
