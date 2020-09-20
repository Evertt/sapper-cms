<script>
	import type User from "../../store/User"
	import type Comment from "../../store/Comment"

	export let comment: Comment
	export let user: User

	async function remove() {
		await comment.delete()
	}
</script>

<div class="card">
	<div class="card-block">
		<p class="card-text">{comment.body}</p>
	</div>

	<div class="card-footer">
		<a href='/profile/@{comment.author.username}' class="comment-author">
			<img src={comment.author.image || ""} class="comment-author-img" alt={comment.author.username || ""} />
		</a>

		<a href='/profile/@{comment.author.username}' class="comment-author">{comment.author.username || ""}</a>

		<span class="date-posted">
			{comment.createdAt.toDateString()}
		</span>

		{#if user && comment.author.username === user.username}
			<span class="mod-options">
				<i class="ion-trash-a" on:click={remove}></i>
			</span>
		{/if}
	</div>
</div>