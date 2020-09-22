<div class="col-xs-12 col-md-8 offset-md-2">
  {#if user}
    <div>
      <CommentInput {article} {user} />
    </div>
  {:else}
    <p>
      <a href="/login">Sign in</a> or <a href="/register">sign up</a> to add comments on this article.
    </p>
  {/if}

  {#each comments as comment (comment.id)}
    <Comment {comment} {user} />
  {/each}
</div>

<script>
  import type User from "../../store/User"
  import type Article from "../../store/Article"
  import type CommentModel from "../../store/Comment"
  import CommentInput from "./_CommentInput.svelte"
  import Comment from "./_Comment.svelte"

  export let comments: CommentModel[]
  export let article: Article
  export let user: User
</script>
