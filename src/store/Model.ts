import type Firebase from "firebase-admin"
import { readable, Readable } from "svelte/store"
import type { ModelStatic, ModelType, ExtendedModel } from "./ModelType"
import { db } from "./firebase"
import { throttle } from "../utils"

type ProxyWrapper<T, U> = U & {
  [K in keyof T]: T[K] extends (...a: any) => T
    ? (...a: Parameters<T[K]>) => ProxyWrapper<T, U>
    : T[K]
}

export type Model<T> = ProxyWrapper<Firebase.firestore.Query, Readable<ExtendedModel<T>>>

export function model<T extends ModelStatic, U>(
  Model: ModelType<T, U>,
  q?: Firebase.firestore.Query,
): Model<U> {
  const ref = db.collection(Model.collection)
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
  const store = readable((null as ExtendedModel<U>|null), set => {
    const unsubscribe = query.limit(1).onSnapshot(
      // eslint-disable-next-line max-len
      (snapshot: Firebase.firestore.QuerySnapshot<Firebase.firestore.DocumentData>) => set(snapshot.docs.map(
        doc => {
          const update = throttle((target: ExtendedModel<U>) => {
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
          }) as ExtendedModel<U>
        },
      )[0] ?? null),
    )

    return () => unsubscribe()
  }) as Model<U>

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

          return model(Model, newQuery)
        }
      }
    },
  })
}

type Preloader = (args: { params: any }) => Promise<any>
type PreloaderMaker = (store: Model<any>) => Preloader

export const preloader: PreloaderMaker = store => ({ params }) => new Promise(
  resolve => store.subscribe(
    data => data.length && resolve(params),
  ),
)
