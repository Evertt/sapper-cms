/* eslint-disable no-use-before-define */
/* eslint-disable max-len */
import "weakref-pollyfill"
import type Firebase from "firebase-admin"
import { Observable, Subject, firstValueFrom } from "rxjs"
import {
  startWith, takeUntil, take, refCount, publishReplay,
} from "rxjs/operators"
import { writable } from "svelte/store"
import { db, serverTimestamp } from "./firebase"
import { difference } from "../utils"

const mode = process.env.NODE_ENV
const dev = mode === "development"

type Query = Firebase.firestore.Query

function isQuery(possibleQuery: any): possibleQuery is Query {
  return "where" in possibleQuery
}

type ExcludeFunctionKeys<T> = Pick<
  T,
  { [K in keyof T]: T[K] extends CollectionQuery<any> | ((...args: any) => any) ? never : K }[keyof T]
>

export type Props<T> = {
  [K in keyof ExcludeFunctionKeys<T>]: T[K]
}

export type PropsRequired<T, K extends keyof Props<T>> = Partial<Props<T>> & Required<Pick<Props<T>, K>>
export type PropsOptional<T, K extends keyof Props<T>> = Props<T> & Partial<Pick<Props<T>, K>>

type ProxyWrapper<T, U> = {
  [K in keyof T]: T[K] extends (...a: any) => T
    ? (...a: Parameters<T[K]>) => ProxyWrapper<T, U>
    : T[K]
} & U

type Unsubscriber = { unsubscribe(): void }
export type CollectionStore<M extends Model> = Promise<M[]> & Observable<M[]> & Unsubscriber
export type ModelStore<M extends Model> = Promise<M> & Observable<M> & Unsubscriber & {
  id: string
}

export type CollectionQuery<ModelType extends typeof Model> = ProxyWrapper<Query, CollectionQueryMethods<ModelType>>
export type ModelQuery<ModelType extends typeof Model> = ProxyWrapper<Query, ModelQueryMethods<ModelType>>

type ModelQueryMethods<ModelType extends typeof Model> = ModelStore<InstanceType<ModelType>>
type CollectionQueryMethods<ModelType extends typeof Model> = CollectionStore<InstanceType<ModelType>> & {
  first(): ModelQueryMethods<ModelType>
  add(model: ConstructorParameters<ModelType>[0]): Promise<void>
}

const metadata = new Map()
const subs: ((t: any, id: string) => void)[] = []

function makeProxy<ModelType extends typeof Model>(customMethods: any, cb: any, query: Query, ModelClass: ModelType) {
  return new Proxy(customMethods, {
    get(target, prop, receiver) {
      // If the requested prop is in our custom methods thingy,
      // then that takes precedent.
      if (prop in target) {
        return Reflect.get(target, prop, receiver)
      }

      // Otherwise we take a look into the query object we have
      const queryProp = Reflect.get(query, prop, receiver) as any

      // If the requested prop is indeed a function on the query object
      if (typeof queryProp === "function") {
        // Then we return a slightly altered version of that function.
        return (...args: any[]) => {
          // Which forwards the call to the function on the query object.
          const queryMethod = queryProp.bind(query)
          const result = queryMethod(...args)

          // And then checks if the result is another query object.
          if (isQuery(result)) {
            // If it is, then wrap that in another Collection type
            return cb(ModelClass, result)
          }
          // If not, then just return the result transparently.
          return result
        }
      }

      // If queryFunc anything other than a function,
      // then just return that without wrapping it.
      return queryProp
    },
  })
}

// eslint-disable-next-line no-shadow
const extend = <T>(observable: Observable<T>, unsubscriber: Subject<void>): Observable<T> & Promise<T> & Unsubscriber => {
  const combined = observable
    .pipe(publishReplay(1), refCount())
    .pipe(process.browser ? takeUntil(unsubscriber) : take(1)) as Observable<T> & Promise<T> & Unsubscriber

  combined.then = (onFulfilled, onRejected) => firstValueFrom(combined).then(onFulfilled, onRejected)
  combined.catch = onRejected => firstValueFrom(combined).catch(onRejected)
  combined.finally = onFinally => firstValueFrom(combined).finally(onFinally)
  combined.unsubscribe = () => {
    unsubscriber.next()
    unsubscriber.complete()
  }

  return combined
}

function initModel<ModelType extends typeof Model>(ModelClass: ModelType, doc: Firebase.firestore.QueryDocumentSnapshot): InstanceType<ModelType> {
  const data = doc.data()

  for (const key in data) {
    if (data[key] && typeof data[key] === "object" && "toDate" in data[key]) {
      data[key] = data[key].toDate()
    }
  }

  return new ModelClass({
    id: doc.id,
    docRef: doc.ref,
    ...data,
  }) as InstanceType<ModelType>
}

const subscriptionCounts = writable({} as { [key: string]: number })
export const snapshots = writable({} as any)

if (dev) {
  if (process.browser) {
    snapshots.subscribe(counts => {
      // console.clear()
      (window as any).userSnapshotCount = counts.User
    })
  }

  // This is here for debug purposes.
  // You know, when you get a memory leak.

  subscriptionCounts.subscribe(counts => {
    console.log(counts)
  })
}

const queryStoreCache = new Map()

function docQuery<ModelType extends typeof Model>(
  ModelClass: ModelType,
  queryOrId: Query | string = db.collection(ModelClass.collection) as Query,
): ModelQuery<ModelType> {
  const query = typeof queryOrId === "string"
    ? db.collection(ModelClass.collection).doc(queryOrId) as unknown as Query
    : queryOrId

  if (query.limit === undefined) {
    // eslint-disable-next-line no-param-reassign
    query.limit = () => query
  }

  const unsubscriber = new Subject<void>()

  const myCustomMethods = extend((new Observable<InstanceType<ModelType>>(
    subscriber => {
      const { name } = ModelClass

      const unsubscribe = query.limit(1).onSnapshot(
        (snapshot: any) => {
          if (snapshot.empty === true || snapshot.exists === false) {
            subscriber.error(new Error(`${ModelClass.name} not found.`))
          } else {
            const doc = snapshot.docs ? snapshot.docs[0] : snapshot

            if (doc.data().username) {
              const { username } = doc.data()

              snapshots.update($snapshots => {
                const count = $snapshots[name] && $snapshots[name][username]

                return {
                  ...$snapshots,
                  [name]: {
                    ...$snapshots[name],
                    [username]: (count || 0) + 1,
                  },
                }
              })
            }
            const model = initModel(ModelClass, doc)
            subscriber.next(model as any)
          }
        },
      )

      subscriptionCounts.update(counts => ({
        ...counts, [name]: (counts[name] || 0) + 1,
      }))

      return () => {
        unsubscribe()
        subscriptionCounts.update(counts => ({
          ...counts, [name]: (counts[name] || 0) - 1,
        }))
      }
    },
  )), unsubscriber)

  // Then we create a proxy
  const proxy = makeProxy(myCustomMethods, docQuery, query, ModelClass) as ModelQuery<ModelType>

  const key = typeof queryOrId === "string"
    ? `${ModelClass.collection}/${queryOrId}`
    : JSON.stringify((query.limit(1) as any).jd)

  const cachedQueryStore = queryStoreCache.get(key)
  if (cachedQueryStore && cachedQueryStore.deref()) {
    return cachedQueryStore.deref()
  }
  queryStoreCache.set(key, new WeakRef(proxy))

  return proxy
}

function colQuery<ModelType extends typeof Model>(
  ModelClass: ModelType,
  query: Query = db.collection(ModelClass.collection) as Query,
): CollectionQuery<ModelType> {
  const unsubscriber = new Subject<void>()

  const myCustomMethods = extend((new Observable<InstanceType<ModelType>[]>(
    subscriber => {
      const unsubscribe = query.onSnapshot(
        snapshot => subscriber.next(
          snapshot.docs.map(
            doc => initModel(ModelClass, doc),
          ),
        ),
      )

      const { name } = ModelClass
      subscriptionCounts.update(counts => ({
        ...counts, [name]: (counts[name] || 0) + 1,
      }))

      return () => {
        unsubscribe()
        subscriptionCounts.update(counts => ({
          ...counts, [name]: (counts[name] || 0) - 1,
        }))
      }
    },
  )), unsubscriber) as CollectionQueryMethods<ModelType>

  myCustomMethods.first = () => docQuery(ModelClass, query)
  myCustomMethods.add = async model => {
    const { id: {}, docRef: {}, ...rest } = model as any
    const modelClass = new ModelClass(rest as any)
    await modelClass.save()
  }

  // Then we create a proxy
  const proxy = makeProxy(myCustomMethods, colQuery, query, ModelClass) as CollectionQuery<ModelType>

  const key = JSON.stringify((query as any).jd)
  const cachedQueryStore = queryStoreCache.get(key)
  if (cachedQueryStore && cachedQueryStore.deref()) {
    return cachedQueryStore.deref()
  }
  queryStoreCache.set(key, new WeakRef(proxy))

  return proxy
}

export default class Model {
  static collection = ""

  public docRef?: Firebase.firestore.DocumentReference
  public id?: string
  public createdAt: Date
  public updatedAt?: Date

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(init: any) {
    this.docRef = init.docRef
    this.id = this.docRef?.id || init.id

    if (!init.createdAt) {
      this.createdAt = new Date()
    } else if (typeof init.createdAt === "string") {
      this.createdAt = new Date(init.createdAt)
    } else if ("toDate" in init.createdAt) {
      this.createdAt = init.createdAt.toDate()
    } else {
      this.createdAt = init.createdAt
    }

    if (!init.updatedAt) return
    if (typeof init.updatedAt === "string") {
      this.updatedAt = new Date(init.updatedAt)
    } else if ("toDate" in init.updatedAt) {
      this.updatedAt = init.updatedAt.toDate()
    } else {
      this.updatedAt = init.updatedAt
    }
  }

  static query<T extends typeof Model>(this: T): CollectionQuery<T> {
    return colQuery(this as any)
  }

  static find<T extends typeof Model>(this: T, id: string): ModelQuery<T> {
    return docQuery(this as any, id)
  }

  async save(updateOrReplace: "update"|"replace" = "replace"): Promise<void> {
    const data: any = { ...this }

    delete data.id
    delete data.docRef
    delete data.createdAt
    delete data.updatedAt

    await Promise.all(Object.keys(data).map(async key => {
      if (data[key] == null) return

      if (data[key].constructor?.name === "Observable") {
        delete data[key]
      }
    }))

    const md = metadata.get(this) || {}

    await Promise.all(Object.keys(md).map(async key => {
      if (key === "id" || !md[key]) return

      if ("then" in md[key]) {
        const model = await md[key]
        if (model.docRef == null) await model.save()
        data[key] = model.docRef
      }
    }))

    if (this.id) {
      this.docRef = this.docRef
        || db.collection((this.constructor as any).collection).doc(this.id) as Firebase.firestore.DocumentReference
      const doc = await this.docRef.get()

      if (doc.exists && updateOrReplace === "update") {
        const diff = difference(data, doc.data())

        Object.keys(diff).forEach(key => {
          if (diff[key] === undefined) {
            delete diff[key]
          }
        })

        if (Object.keys(diff).length) {
          diff.updatedAt = serverTimestamp()
          await this.docRef.update(diff)
        }

        Object.assign(this, (await this.docRef.get()).data())
      } else {
        data.createdAt = this.createdAt
        data.updatedAt = serverTimestamp()
        await this.docRef.set(data)
      }
    } else {
      const doc = db.collection((this.constructor as any).collection).doc()
      await doc.set({ ...data, createdAt: serverTimestamp(), updatedAt: null })
      this.docRef = doc as Firebase.firestore.DocumentReference
      this.id = doc.id
    }
  }

  async updateOrCreate(): Promise<void> {
    await this.save("update")
  }

  async delete(): Promise<void> {
    await this.docRef?.delete()
  }

  toJSON<T extends typeof Model>(): Props<InstanceType<T>> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { docRef, ...rest } = this

    return rest as unknown as Props<InstanceType<T>>
  }
}

const addSubscription = (model: Model, fn: (t: any, id: string) => void): void => {
  if (Object.getOwnPropertyDescriptor(model, "id") === undefined) {
    /* eslint-disable no-inner-declarations */
    function get(this: Model) {
      return metadata.get(this)?.id
    }

    function set(this: Model, id: string) {
      metadata.set(this, { id })
      subs.forEach((cb: (t: any, id: string) => void) => cb(this, id))
    }

    Object.defineProperty(model, "id", { get, set })
  }

  subs.push(fn)
}

export const subcollection = <ModelType extends typeof Model>(SubModelClass: ModelType) => <
  Target extends Model & Record<Key, CollectionQuery<ModelType>>, Key extends string | symbol
>(target: Target, key: Key): void => {
  const setNewQuery = (t: any, id: string) => {
    const collectionPath = (target.constructor as any).collection

    const newClass = class extends (SubModelClass as any) {
      static collection = `${collectionPath}/${id}/${key}`
    }

    // eslint-disable-next-line no-param-reassign
    t[key] = newClass.query()
  }

  addSubscription(target, setNewQuery)
}

export const belongsTo = <ModelType extends typeof Model>(SubModelClass: ModelType) => <
  Target extends Model & Record<Key, ModelQuery<ModelType>>, Key extends string | symbol
>(target: Target, key: Key): void => {
  function get(this: InstanceType<ModelType>) {
    const md = metadata.get(this) || {}

    return md[key]
  }

  function set(this: InstanceType<ModelType>, newValue: any) {
    let query: any

    // eslint-disable-next-line no-empty
    if (!newValue) {
    } else if (typeof newValue === "string") {
      query = newValue
    } else if ("docRef" in newValue) {
      query = newValue.docRef.id
    } else if ("id" in newValue) {
      query = newValue.id
    } else {
      // eslint-disable-next-line no-param-reassign
      newValue = (new Observable()).pipe(startWith(newValue), take(1))
    }

    metadata.set(this, {
      ...metadata.get(this),
      [key]: query ? docQuery(SubModelClass as any, query as any) : newValue,
    })
  }

  Object.defineProperty(target, key, { get, set })
}
