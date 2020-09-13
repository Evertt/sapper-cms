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
