declare module "quill-delta" {
  import type { Delta as DeltaInterface } from "types-quill-delta"

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Delta extends DeltaInterface {}

  class Delta {
    constructor(ops?: Delta["ops"] | { ops: Delta["ops"] })
  }

  export default Delta
}
