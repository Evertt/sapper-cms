import type { Props } from "./Model"
import Model from "./MM"

export default class Misc extends Model {
  static collection = "misc"

  public id?: string
  public tags: string[] = []

  constructor(params: Props<Misc>) {
    super(params)
    Object.assign(this, params)
  }
}
