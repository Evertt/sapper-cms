import Model, { Props } from "./Model"

class Author {
  static collection = "authors"

  public id?: string
  public username: string
  public bio: string|null
  public image: string
  public following: false

  constructor(params: Props<Author>) {
    this.username = params.username
    this.bio = params.bio
    this.image = params.image
    this.image = params.image
    this.following = params.following
  }
}

export default class extends Model(Author) {}
