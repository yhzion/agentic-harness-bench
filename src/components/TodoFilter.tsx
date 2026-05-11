import type { JSX } from 'react'
import type { TodoFilter as TodoFilterValue } from '../types/todo'
import styles from './TodoFilter.module.css'

export type TodoFilterProps = {
  value: TodoFilterValue
  onChange: (value: TodoFilterValue) => void
}

const FILTERS: { value: TodoFilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

export function TodoFilter(props: TodoFilterProps): JSX.Element {
  const { value, onChange } = props

  return (
    <div className={styles.group}>
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          className={`${styles.tab} ${value === filter.value ? styles.tabActive : ''}`}
          aria-pressed={value === filter.value ? 'true' : 'false'}
          onClick={() => onChange(filter.value)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}
