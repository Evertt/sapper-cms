import Model, { Props } from "./Model"

class Misc {
  static collection = "misc"

  public id?: string
  public tags: string[] = []

  constructor(params: Props<Misc>) {
    Object.assign(this, params)
  }
}

export default class extends Model(Misc) {}
