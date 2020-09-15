<script>
	import ListErrors from '../_components/ListErrors.svelte';
	import CommentInput from './_CommentInput.svelte';
	import Comment from './_Comment.svelte';
	import type CommentModel from "../../store/Comment"
	import type Article from '../../store/Article'

	export let comments: CommentModel[]
	export let errors: any
	export let article: Article
	export let user: any

	console.log({ comments })
</script>

<div class="col-xs-12 col-md-8 offset-md-2">
	{#if user}
		<div>
			<ListErrors {errors}/>
			<CommentInput {article} {user} on:commented='{({ detail }) => comments = [detail.comment, ...comments] }'/>
		</div>
	{:else}
		<p>
			<a href="/login">Sign in</a> or <a href="/register">sign up</a> to add comments on this article.
		</p>
	{/if}

	{#each comments as comment, i (comment.id)}
		<Comment {comment} {user} on:deleted='{() => comments = comments.filter((_, index) => i !== index)}'/>
	{/each}
</div>