import Model, { SubCollection, CollectionQuery } from "rxfirestorm"
import { differenceWith, isEqual } from "lodash-es"

class ArchivedPage extends Model {
  static collection = "history"

  constructor(init?: any) {
    super(init)
    Object.assign(this, init)
  }
}

export default class Page extends Model {
  static collection = "pages"

  public published: any = {}
  public draft: any = null
  @SubCollection(ArchivedPage) public history!: CollectionQuery<typeof ArchivedPage>

  constructor(init?: { published: any, draft?: any }) {
    super(init)
    Object.assign(this, init)
  }

  get hasUnfinishedDraft(): boolean {
    if (!this.draft) return false
    const draft = Object.entries(this.draft)
    const published = Object.entries(this.published)
    return differenceWith(draft, published, isEqual).length > 0
  }

  async publishDraft(): Promise<void> {
    await this.history.add(this.published)
    this.published = this.draft
    this.draft = null
    await this.save()
  }
}
