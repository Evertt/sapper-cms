/* eslint-disable max-len */
import type Firebase from "firebase-admin"
import { Observable, firstValueFrom } from "rxjs"
import { shareReplay } from "rxjs/operators"
import { db } from "./firebase"
import { difference } from "../utils"

type Query = Firebase.firestore.Query

function isQuery(possibleQuery: any): possibleQuery is Query {
  return "where" in possibleQuery
}

type ExcludeFunctionKeys<T> = Pick<
  T,
  { [K in keyof T]: T[K] extends (...args: any) => any ? never : K }[keyof T]
>

export type Props<T> = {
  [K in keyof ExcludeFunctionKeys<T>]: T[K]
}

interface HasId {
  id?: string
}

interface Constructable<P, T extends HasId> {
  new(params: P): T
  prototype: T
}

type ProxyWrapper<T, U> = {
  [K in keyof T]: T[K] extends (...a: any) => T
    ? (...a: Parameters<T[K]>) => ProxyWrapper<T, U>
    : T[K]
} & U

export type ExtendedModel<U> = U & {
  save(): Promise<void>
  delete(): Promise<void>
  updateOrCreate(): Promise<void>
  toJSON(): Props<U>
}

type ModelStatic = {
  collection: string
}

export type ColQueryWrapper<ModelObject> = ProxyWrapper<Query, ColQueryMethods<ModelObject>>
export type DocQueryWrapper<ModelObject> = ProxyWrapper<Query, DocQueryMethods<ModelObject>>

type ExtendedModelStatic<ModelObject> = ModelStatic & {
  query(): ColQueryWrapper<ModelObject>
}

type DocQueryMethods<ModelObject> = Promise<ModelObject> & Observable<ModelObject>
type ColQueryMethods<ModelObject> = Promise<ModelObject[]> & Observable<ModelObject[]> & {
  first(): DocQueryMethods<ModelObject>
  add(model: Partial<ModelObject>): Promise<void>
}

export type ModelType<P, ModelObject extends HasId> = ExtendedModelStatic<ModelObject> & Constructable<P, ExtendedModel<ModelObject>>

function makeProxy(customMethods: any, cb: any, query: Query, ModelClass: any) {
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
const toPromise = <T>(observable: Observable<T>): Observable<T> & Promise<T> => {
  const combined = observable as Observable<T> & Promise<T>

  combined.then = (onFulfilled, onRejected) => firstValueFrom(combined).then(onFulfilled, onRejected)
  combined.catch = onRejected => firstValueFrom(combined).catch(onRejected)
  combined.finally = onFinally => firstValueFrom(combined).finally(onFinally)

  return combined
}

function initModel<ModelObject>(ModelClass: Constructable<any, ModelObject>, doc: Firebase.firestore.QueryDocumentSnapshot): ModelObject {
  return new ModelClass({
    id: doc.id,
    docRef: doc.ref,
    ...doc.data(),
  })
}

function docQuery<P, ModelObject>(
  ModelClass: ModelType<P, ModelObject>,
  query: Query = db.collection(ModelClass.collection) as Query,
): DocQueryWrapper<ModelObject> {
  if (query.limit === undefined) {
    // eslint-disable-next-line no-param-reassign
    query.limit = () => query
  }

  const myCustomMethods = toPromise((new Observable<ModelObject>(
    subscriber => query.limit(1).onSnapshot(
      (snapshot: any) => {
        if (snapshot.empty === true || snapshot.exists === false) {
          subscriber.error(new Error(`${ModelClass.name} not found.`))
        } else {
          const doc = snapshot.docs ? snapshot.docs[0] : snapshot
          const model = initModel(ModelClass, doc)
          subscriber.next(model)
        }
      },
    ),
  )).pipe(shareReplay(1)))

  // Then we create a proxy
  return makeProxy(myCustomMethods, docQuery, query, ModelClass) as DocQueryWrapper<ModelObject>
}

function colQuery<P, ModelObject>(
  ModelClass: ModelType<P, ModelObject>,
  query: Query = db.collection(ModelClass.collection) as Query,
): ColQueryWrapper<ModelObject> {
  const myCustomMethods = toPromise((new Observable<ModelObject[]>(
    subscriber => query.onSnapshot(
      snapshot => subscriber.next(
        snapshot.docs.map(
          doc => initModel(ModelClass, doc),
        ),
      ),
    ),
  )).pipe(shareReplay(1))) as ColQueryMethods<ModelObject>

  myCustomMethods.first = () => docQuery(ModelClass, query)
  myCustomMethods.add = async model => {
    const { id: {}, docRef: {}, ...rest } = model as any
    const modelClass = new ModelClass(rest as any)
    await modelClass.save()
  }

  // Then we create a proxy
  return makeProxy(myCustomMethods, colQuery, query, ModelClass) as ColQueryWrapper<ModelObject>
}

export default class Model {
  static collection = ""

  public docRef?: Firebase.firestore.DocumentReference
  public id?: string

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(init: any) {
    this.docRef = init.docRef
    this.id = this.docRef?.id || init.id
  }

  static query<T extends typeof Model>(this: T): ColQueryWrapper<InstanceType<T>> {
    return colQuery(this as any)
  }

  static find<T extends typeof Model>(this: T, id: string): DocQueryWrapper<InstanceType<T>> {
    const query = db.collection(this.collection).doc(id)

    return docQuery(this as any, query as any)
  }

  async save(updateOrReplace: "update"|"replace" = "replace"): Promise<void> {
    const data: any = { ...this }
    delete data.id
    delete data.docRef

    await Promise.all(Object.keys(data).map(async key => {
      if (data[key] == null) return

      if (Object.getPrototypeOf(data[key].constructor).name === "Model") {
        if (data[key].docRef == null) await data[key].save()
        data[key] = data[key].docRef
      } else if (data[key].constructor?.name === "Observable") {
        delete data[key]
      }
    }))

    if (this.id) {
      this.docRef = this.docRef
        || db.collection((this.constructor as any).collection).doc(this.id) as Firebase.firestore.DocumentReference
      const doc = await this.docRef.get()

      if (doc.exists && updateOrReplace === "update") {
        const diff = difference(data, doc.data())
        Object.keys(diff).forEach(key => {
          if (diff[key] === undefined) delete diff[key]
        })
        Object.keys(diff).forEach(key => {
          if (diff[key] === undefined) delete diff[key]
        })
        if (Object.keys(diff).length) {
          data.updatedAt = new Date()
          await this.docRef.update(data)
        }
        Object.assign(this, (await this.docRef.get()).data())
      } else {
        data.updatedAt = new Date()
        await this.docRef.set(data)
      }
    } else {
      const doc = db.collection((this.constructor as any).collection).doc()
      await doc.set({ ...data, createdAt: new Date(), updated: null })
      this.id = doc.id
      this.docRef = doc as Firebase.firestore.DocumentReference
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

const metadata = new Map()
const subs: ((t: any, id: string) => void)[] = []

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

export const subcollection = <S extends Model, C extends Constructable<any, S>, T extends Model>(SubModelClass: C) => (target: T, key: string): void => {
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

export const belongsTo = <S extends Model, C extends Constructable<any, S>, T extends Model>(SubModelClass: C) => (target: T, key: string): void => {
  function get(this: S) {
    const md = metadata.get(this) || {}

    if (!md.relatedStore) {
      const query = typeof md.relatedId === "string"
        ? db.collection((SubModelClass as any).collection).doc(md.relatedId)
        : md.relatedId

      md.relatedStore = docQuery(SubModelClass as any, query as any)
    }

    return md.relatedStore
  }

  function set(this: S, newId: any) {
    metadata.set(this, {
      ...metadata.get(this),
      relatedId: newId,
      relatedStore: null,
    })
  }

  Object.defineProperty(target, key, { get, set })
}
