<script>
	import CommentInput from './_CommentInput.svelte';
	import Comment from './_Comment.svelte';
	import type CommentModel from "../../store/Comment"
	import type Article from '../../store/Article'

	export let comments: CommentModel[]
	export let article: Article
	export let user: any
</script>

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