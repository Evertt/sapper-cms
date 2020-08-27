export type ModelStatic = { collection: string }
type Constructable<T> = { new(...args: any[]): T }
export type ModelType<T extends ModelStatic, U> = T & Constructable<U>

export type ExtendedModel<U> = U & {
  id: string
  delete(): void
}

export function Model<T extends ModelStatic, U>(constructor: ModelType<T, U>): ModelType<T, U> {
  return constructor
}
