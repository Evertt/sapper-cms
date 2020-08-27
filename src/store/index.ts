import type { Model } from "./Model"
import type { Collection } from "./Collection"

export { model } from "./Model"
export { collection } from "./Collection"
export type { Model, Collection }

type Preloader = (args: { params: any }) => Promise<any>
type PreloaderMaker = (store: Collection<any>) => Preloader

export const preloader: PreloaderMaker = store => ({ params }) => new Promise(
  resolve => store.subscribe(
    data => data.length && resolve(params),
  ),
)
