import Model, { SubCollection, CollectionQuery } from "rxfirestorm"
import type { Props } from "rxfirestorm/dist/types"
import { differenceWith, isEqual } from "lodash-es"
import { Writable, writable, get } from "svelte/store"

class ArchivedPage extends Model {
  static collection = "history"

  constructor(init?: any) {
    super(init)
    Object.assign(this, init)
  }
}

export default class Page extends Model {
  static collection = "pages"

  public draft: any|null = null
  @SubCollection(ArchivedPage) public history!: CollectionQuery<typeof ArchivedPage>

  constructor(init?: { body: string }) {
    super(init)
    Object.assign(this, init)
  }

  get hasUnfinishedDraft(): boolean {
    if (!this.draft) return false
    const draft = Object.entries(this.draft)
    const published = Object.entries(this)
    return differenceWith(draft, published, isEqual).length > 0
  }

  getDraft(): any {
    if (!this.draft) {
      const data = this.getStrippedData() as any
      delete data.history
      delete data.draft
      this.draft = data
    }
    return this.draft
  }

  async publishDraft(): Promise<void> {
    const { draft, ...data } = this.getStrippedData() as any
    delete data.history
    await this.history.add(data)
    Object.assign(this, draft)
    this.draft = null
    this.save()
  }
}
