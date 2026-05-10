export interface ExampleRepository<T> {
  load(): T[]
  save(items: T[]): void
  clear(): void
}
