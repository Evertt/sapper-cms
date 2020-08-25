import type Firebase from "firebase-admin"
import { readable, Readable } from "svelte/store"
import { db } from "./firebase"
import { throttle } from "../utils"

interface Model {
  id: string,
  delete: () => void
}

export type { Model }

type Store<T extends Model> = Readable<T[]> & Firebase.firestore.Query & {
  add: (doc: T) => void
}

export function collection<T extends Model>(
  reference: string|Firebase.firestore.CollectionReference,
  q?: Firebase.firestore.Query,
): Store<T> {
  const ref = typeof reference === "string"
    ? db.collection(reference) as Firebase.firestore.CollectionReference : reference

  const query = q ?? ref

  /**
   * This block of code creates a readable Svelte store,
   * which subscribes itself to Firestore's live updating snapshots.
   *
   * And whenever a new snapshot comes in, we wrap every document in it
   * in a proxy, so that whenever we change a property on a document,
   * that change is then automatically sent back to Firestore.
   *
   * Finally we also add a delete method to every document,
   * for complete crud control.
   */
  const store = readable(([] as T[]), (set) => {
    const unsubscribe = query.onSnapshot(
      (snapshot) => set(snapshot.docs.map(
        (doc) => {
          const update = throttle((target: T) => {
            const data: any = {
              ...target, updated: new Date(),
            }

            delete data.id

            doc.ref.update(data)
          }, 100, 500)

          return new Proxy({ id: doc.id, ...doc.data() }, {
            get(target, prop, receiver) {
              return prop === "delete"
                ? doc.ref.delete.bind(doc.ref)
                : Reflect.get(target, prop, receiver)
            },
            set(target, prop, newValue) {
              Reflect.set(target, prop, newValue)
              update(target)
              return true
            },
          }) as unknown as T
        },
      )),
    )

    return () => unsubscribe()
  }) as Store<T>

  // We also add an `add` method to our store,
  // which forwards the call to the firestore collection reference.
  store.add = (doc: T) => ref.add({ created: new Date(), ...doc })

  /**
   * Finally we wrap the entire store in another proxy.
   * The purpose of this proxy is that you can build queries with the store.
   * And that for every additional query method you just get back a new Svelte store.
   */
  return new Proxy(store, {
    // eslint-disable-next-line consistent-return
    get(target, prop, receiver) {
      if (prop in target) {
        return Reflect.get(target, prop, receiver)
      }

      const queryFunc = Reflect.get(query, prop, receiver) as any

      if (typeof queryFunc === "function") {
        return (...args: any[]) => {
          const newQuery = queryFunc.bind(query)(...args)

          return collection(ref, newQuery)
        }
      }
    },
  })
}

type Preloader = (args: { params: any }) => Promise<any>
type PreloaderMaker = (store: Store<any>) => Preloader

export const preloader: PreloaderMaker = (store) => ({ params }) => new Promise(
  (resolve) => store.subscribe(
    (data) => {
      console.log({ data })
      return data.length && resolve(params)
    },
  ),
)
