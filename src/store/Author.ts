import type { Props } from "./Model"
import Model from "./MM"

export default class Author extends Model {
  static collection = "authors"

  public id?: string
  public username: string
  public bio: string|null
  public image: string
  public following: false

  constructor(params: Props<Author>) {
    super(params)
    this.username = params.username
    this.bio = params.bio
    this.image = params.image
    this.image = params.image
    this.following = params.following
  }
}
