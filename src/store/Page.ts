import Model from "rxfirestorm"

export default class Page extends Model {
  static collection = "pages"

  public body = ""

  constructor(init?: { body: string }) {
    super(init)
    Object.assign(this, init)
  }
}
