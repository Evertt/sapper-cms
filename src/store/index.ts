import type { ModelType, ColQueryWrapper } from "./Model"

import Post from "./Post"

export { Post }

type Preloader = (args: { params: any }) => Promise<any>

// eslint-disable-next-line max-len, @typescript-eslint/explicit-module-boundary-types
export function preloader(modelType: any, name?: string, key?: string): Preloader {
  return function preload(this: any, args: { params: any }) {
    if (name == null || key == null) {
      const q = modelType as ColQueryWrapper<any>

      return new Promise(resolve => {
        q.subscribe((data?: any[]) => data != null && resolve())
      })
    }

    const model = (modelType as ModelType<any, any>).query()
      .where(key, "==", args.params[key]).first()

    return new Promise(
      resolve => model.subscribe(
        data => {
          if (data === undefined) return
          if (data === null) this.error(404, `${name} not found`)
          const props: any = {}
          props[name] = model
          resolve(props)
        },
      ),
    )
  }
}
