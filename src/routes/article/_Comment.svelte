<script>
	import type User from "../../store/User"
	import type Comment from "../../store/Comment"

	export let comment: Comment
	export let user: User

	let author = comment.author
	$: author = comment.author

	async function remove() {
		await comment.delete()
	}
</script>

{#if $author}
	<div class="card">
		<div class="card-block">
			<p class="card-text">{comment.body}</p>
		</div>

		<div class="card-footer">
			<a href='/profile/@{$author.username}' class="comment-author">
				<img src={$author.image} class="comment-author-img" alt={$author.username} />
			</a>

			<a href='/profile/@{$author.username}' class="comment-author">{$author.username}</a>

			<span class="date-posted">
				{comment.createdAt.toDateString()}
			</span>

			{#if user && $author.username === user.username}
				<span class="mod-options">
					<i class="ion-trash-a" on:click={remove}></i>
				</span>
			{/if}
		</div>
	</div>
{/if}