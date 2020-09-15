/* eslint-disable max-len */
import type Firebase from "firebase-admin"
import { readable, Readable } from "svelte/store"
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

export type InitParams<T> = {
  [K in keyof ExcludeFunctionKeys<T>]: T[K]
}

interface HasId {
  id?: string
}

interface Constructable<T extends HasId> {
  new(params: InitParams<T>): T
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
}

type ModelStatic = {
  collection: string
}

export type ColQueryWrapper<ModelObject> = ProxyWrapper<Query, ColQueryMethods<ModelObject>>

type ExtendedModelStatic<ModelObject> = ModelStatic & {
  query(): ColQueryWrapper<ModelObject>
  find(id: string): Readable<ExtendedModel<ModelObject>|null>
}

type ColQueryMethods<ModelObject> = {
  fetch(): Promise<ExtendedModel<ModelObject>[]>
  first(): DocQueryWrapper<ModelObject>
} & Readable<ExtendedModel<ModelObject>[]>

type DocQueryMethods<ModelObject> = {
  fetch(): Promise<ExtendedModel<ModelObject>|null>
} & Readable<ExtendedModel<ModelObject>|null>

export type ModelType<ModelObject extends HasId> = ExtendedModelStatic<ModelObject> & Constructable<ExtendedModel<ModelObject>>

type DocQueryWrapper<ModelObject> = ProxyWrapper<Query, DocQueryMethods<ModelObject>>

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

function docQuery<ModelObject>(
  ModelClass: ModelType<ModelObject>,
  query: Query = db.collection(ModelClass.collection) as Query,
): DocQueryWrapper<ModelObject> {
  // First we define our custom method of our Query proxy.
  const myCustomMethods: DocQueryMethods<ModelObject> = {
    async fetch(): Promise<ExtendedModel<ModelObject>|null> {
      const snapshot = await query.limit(1).get()
      return snapshot.docs.map(
        doc => new ModelClass({ id: doc.id, ...doc.data() } as any),
      )[0] ?? null
    },

    ...(readable(undefined as undefined|ExtendedModel<ModelObject>|null, set => {
      const unsubscribe = query.limit(1).onSnapshot(
        snapshot => set(snapshot.docs.map(
          doc => new ModelClass({ id: doc.id, ...doc.data() } as any),
        )[0] ?? null),
      )

      return () => unsubscribe()
    }) as Readable<ExtendedModel<ModelObject>|null>),
  }

  return makeProxy(myCustomMethods, docQuery, query, ModelClass) as DocQueryWrapper<ModelObject>
}

function colQuery<ModelObject>(
  ModelClass: ModelType<ModelObject>,
  query: Query = db.collection(ModelClass.collection) as Query,
): ColQueryWrapper<ModelObject> {
  // First we define our custom method of our Query proxy.
  const myCustomMethods: ColQueryMethods<ModelObject> = {
    async fetch(): Promise<ExtendedModel<ModelObject>[]> {
      const snapshot = await query.get()
      return snapshot.docs.map(
        doc => new ModelClass({ id: doc.id, ...doc.data() } as any),
      )
    },

    ...(readable(undefined as undefined|ExtendedModel<ModelObject>[], set => {
      const unsubscribe = query.onSnapshot(
        snapshot => set(snapshot.docs.map(
          doc => new ModelClass({ id: doc.id, ...doc.data() } as any),
        )),
      )

      return () => unsubscribe()
    }) as Readable<ExtendedModel<ModelObject>[]>),

    first(): DocQueryWrapper<ModelObject> {
      return docQuery(ModelClass, query)
    },
  }

  // Then we create a proxy
  return makeProxy(myCustomMethods, colQuery, query, ModelClass) as ColQueryWrapper<ModelObject>
}

export default function Model<ModelObject extends HasId>(
  ModelClass: ModelStatic & Constructable<ModelObject>,
): ModelType<ModelObject> {
  // I don't know how to type-cast. I'm just doing whatever it takes to make this compile...
  const DerivedClass = class extends (ModelClass as unknown as ModelStatic & Constructable<any>) {
    static query(): ColQueryWrapper<ModelObject> {
      return colQuery(DerivedClass as ModelType<ModelObject>)
    }

    static find(id: string): Readable<ExtendedModel<ModelObject>|null> {
      return readable(undefined as (undefined|null|ExtendedModel<ModelObject>), set => {
        db.collection(ModelClass.collection).doc(id).onSnapshot((doc: any) => {
          set(doc.exists ? new DerivedClass({ id: doc.id, ...doc.data() } as any) : null)
        })
      }) as Readable<ExtendedModel<ModelObject>|null>
    }

    async save(updateOrReplace: "update"|"replace" = "replace"): Promise<void> {
      const data: any = { ...this }
      delete data.id

      if (this.id) {
        const ref = db.collection(ModelClass.collection).doc(this.id)
        const doc = await ref.get()

        if (doc.exists && updateOrReplace === "update") {
          const diff = difference(data, doc.data())
          Object.keys(diff).forEach(key => {
            if (diff[key] === undefined) delete diff[key]
          })
          if (Object.keys(diff).length) {
            data.updatedAt = new Date()
            await ref.update(data)
          }
          Object.assign(this, (await ref.get()).data())
        } else {
          data.updatedAt = new Date()
          await ref.set(data)
        }
      } else {
        const doc = db.collection(ModelClass.collection).doc()
        await doc.set({ ...data, createdAt: new Date(), updated: null })
        this.id = doc.id
      }
    }

    async updateOrCreate(): Promise<void> {
      await this.save("update")
    }

    async delete(): Promise<void> {
      if (!this.id) return
      await db.collection(ModelClass.collection).doc(this.id).delete()
    }
  } as ModelType<ModelObject>

  return DerivedClass
}
