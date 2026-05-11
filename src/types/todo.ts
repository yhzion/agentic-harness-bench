export type Todo = {
  id: string
  title: string
  completed: boolean
  createdAt: number
  updatedAt: number
}

export type TodoFilter = 'all' | 'active' | 'completed'

export type TodoCreateInput = {
  title: string
}

export type TodoUpdateInput = {
  id: string
  title: string
}

export type ValidationResult = { ok: true; value: string } | { ok: false; message: string }
