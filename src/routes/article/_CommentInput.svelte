<script>
	import type Article from "../../store/Article"

	export let article: Article
	export let user: any

	let body = "";

	function submit() {
		article.addComment({ body, author: user })
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