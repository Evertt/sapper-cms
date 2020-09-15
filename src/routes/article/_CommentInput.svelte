<script>
	import { createEventDispatcher } from 'svelte';
	import type Article from "../../store/Article"

	export let article: Article
	export let user: any

	const dispatch = createEventDispatcher();

	let body = '';

	async function submit() {
		const comment = article.addComment({ body, author: user })
		dispatch('commented', comment)
		body = ""
	}
</script>

<form class="card comment-form" on:submit|preventDefault={submit}>
	<div class="card-block">
		<textarea class="form-control" placeholder="Write a comment..." bind:value={body} rows="3"/>
	</div>

	<div class="card-footer">
		<img src={user.image} class="comment-author-img" alt={user.username} >
		<button class="btn btn-sm btn-primary" type="submit">Post Comment</button>
	</div>
</form>