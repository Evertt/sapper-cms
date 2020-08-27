import { Model } from "./ModelType"

@Model export class Post {
  static collection = "posts"

  public slug: string
  public title: string
  public html: string

  constructor(slug: string, title: string, html: string) {
    this.slug = slug
    this.title = title
    this.html = html
  }
}
