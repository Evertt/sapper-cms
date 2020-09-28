import Model from "rxfirestorm"

export default class Misc extends Model {
  static collection = "misc"

  public tags: string[] = []

  constructor(init: { tags?: string[] }) {
    super(init)
    Object.assign(this, init)
  }
}
