import {
  transform,
  isEqualWith,
  isEqual,
  isObject,
} from "lodash-es"

// eslint-disable-next-line @typescript-eslint/ban-types
export function throttle(fn: Function, ...delays: number[]): Function {
  let t1: NodeJS.Timeout|undefined
  let t2: NodeJS.Timeout|undefined
  let activeDelay = 0

  return (...args: any[]) => {
    if (t2) {
      clearTimeout(t2)
      t2 = undefined
    }

    if (t1) {
      return
    }

    t1 = setTimeout(() => {
      fn(...args)
      t1 = undefined

      // Increment the active delay each time
      // and then stick with the last one.
      // eslint-disable-next-line no-plusplus
      activeDelay = Math.min(++activeDelay, delays.length - 1)

      // Set a 2nd `Timeout` that resets the
      // active delay back to the first one.
      t2 = setTimeout(() => {
        activeDelay = 0
        t2 = undefined
      }, delays[activeDelay])
    }, delays[activeDelay])
  }
}

function customizer(baseValue: any, value: any): boolean {
  if (Array.isArray(baseValue) && Array.isArray(value)) {
    return isEqual(baseValue.sort(), value.sort())
  }

  if (baseValue && baseValue.firestore && value && value.firestore) {
    return baseValue.path === value.path
  }

  return isEqual(baseValue, value)
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function difference(object: any, base: any): any {
  /* eslint-disable no-param-reassign */
  // eslint-disable-next-line no-shadow
  function changes(object: any, base: any) {
    return transform(object, (result: any, value: any, key: string) => {
      if (!isEqualWith(value, base[key], customizer)) {
        // eslint-disable-next-line no-param-reassign
        result[key] = (isObject(value) && isObject(base[key])) ? changes(value, base[key]) : value
      }
    }, {})
  }

  if (object.docRef) {
    object = { ...object }
    delete object.docRef
  }

  if (base.docRef) {
    base = { ...base }
    delete base.docRef
  }

  return changes(object, base)
}

export const sleep = (ms: number): Promise<void> => new Promise(r => setTimeout(() => r(), ms))
