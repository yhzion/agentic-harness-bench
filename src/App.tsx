import { TodoInput } from './components/TodoInput'
import { TodoFilter } from './components/TodoFilter'
import { TodoList } from './components/TodoList'
import { useTodos } from './hooks/useTodos'
import styles from './App.module.css'

export function App() {
  const {
    visibleTodos,
    filter,
    addTodoAction,
    toggleTodoAction,
    updateTodoTitleAction,
    removeTodoAction,
    setFilterAction,
  } = useTodos()

  return (
    <>
      <div className={styles.hero}>
        <div className={styles.container}>
          <h1>Todo</h1>
        </div>
      </div>
      <main className={styles.body}>
        <div className={styles.container}>
          <TodoInput onAdd={addTodoAction} />
          <TodoList
            todos={visibleTodos}
            onToggle={toggleTodoAction}
            onRemove={removeTodoAction}
            onUpdateTitle={updateTodoTitleAction}
          />
          <TodoFilter value={filter} onChange={setFilterAction} />
        </div>
      </main>
      <footer className={styles.footer} role="contentinfo">
        <div className={styles.container}>
          &copy; {new Date().getFullYear()} Todo. All rights reserved.
        </div>
      </footer>
    </>
  )
}
