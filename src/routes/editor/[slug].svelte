<script context="module">
  import Article from "../../store/Article"

  export async function preload(this: any, { params }: any, { user }: any) {
    if (!user) {
      this.redirect(302, `/login`)
    }

    const article = Article.query()
      .where("slug", "==", params.slug).first()

    await article

    return { article }
  }
</script>

<Editor article={$article} />

<script>
  import Editor from "./_Editor.svelte"
  import { stores } from "@sapper/app"

  const { page } = stores()
  const { slug } = $page.params

  export let article = Article.query()
    .where("slug", "==", slug).first()
</script>
