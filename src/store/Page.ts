import Model, { SubCollection, CollectionQuery } from "rxfirestorm"
import Delta from "quill-delta"

export type Draft = Pick<Delta, "ops">

class ArchivedPage extends Model {
  static collection = "history"

  public body = ""

  constructor(init?: { body: string }) {
    super(init)
    Object.assign(this, init)
  }
}

export default class Page extends Model {
  static collection = "pages"

  public body = ""
  public draft: Draft|null = null
  @SubCollection(ArchivedPage) public history!: CollectionQuery<typeof ArchivedPage>

  get delta(): Delta|null {
    return this.draft ? new Delta(this.draft) : null
  }

  set delta(newDelta: Delta|null) {
    this.draft = newDelta ? { ...newDelta } : null
  }

  constructor(init?: { body: string }) {
    super(init)
    Object.assign(this, init)
  }

  async publish(body: string): Promise<void> {
    await this.history.add({ body: this.body })
    this.draft = null
    this.body = body
    this.save()
  }
}
