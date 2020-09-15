import Model, { InitParams } from "./Model"

class Author {
  static collection = "authors"

  public id?: string
  public username: string
  public bio: string|null
  public image: string
  public following: false

  constructor(params: InitParams<Author>) {
    this.username = params.username
    this.bio = params.bio
    this.image = params.image
    this.image = params.image
    this.following = params.following
  }
}

export default class extends Model(Author) {}
