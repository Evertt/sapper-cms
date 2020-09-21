import Model from "./Model"

export default class Misc extends Model {
  static collection = "misc"

  public tags: string[]

  constructor(init: Partial<{ tags: string[] }>) {
    super(init)
    this.tags = init.tags || []
  }
}
