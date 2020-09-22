<script>
	import { goto } from '@sapper/app';
	import type Article from '../../store/Article';
	import ListErrors from '../_components/ListErrors.svelte';

	export let article: Article

	let inProgress = false;
	let errors: any

	function addTag(input: any) {
		article.tagList = [...article.tagList, input.value];
		input.value = '';
	}

	function remove(index: any) {
		article.tagList = [...article.tagList.slice(0, index), ...article.tagList.slice(index + 1)];
	}

	async function publish() {
		inProgress = true

		if (article.slug === "") {
			article.setSlug()
		}

		await article.updateOrCreate()
		goto(`/article/${article.slug}`)

		inProgress = false
	}

	function enter(node: Element, callback: (node: Element) => void) {
		const onkeydown: EventListener = (event: Event) => {
			if ((event as KeyboardEvent).code === "Enter") callback(node);
		}

		node.addEventListener('keydown', onkeydown);

		return {
			destroy() {
				node.removeEventListener('keydown', onkeydown);
			}
		};
	}
</script>

<div class="editor-page">
	<div class="container page">
		<div class="row">
			<div class="col-md-10 offset-md-1 col-xs-12">
				<ListErrors {errors}/>

				<form>
					<fieldset>
						<fieldset class="form-group">
							<input class="form-control form-control-lg" type="text" placeholder="Article Title" bind:value={article.title}>
						</fieldset>

						<fieldset class="form-group">
							<input class="form-control" type="text" placeholder="What's this article about?" bind:value={article.description}>
						</fieldset>

						<fieldset class="form-group">
							<textarea class="form-control" rows="8" placeholder="Write your article (in markdown)" bind:value={article.body}/>
						</fieldset>

						<fieldset class="form-group">
							<input class="form-control" type="text" placeholder="Enter tags" use:enter={addTag}>

							<div class="tag-list">
								{#each article.tagList as tag, i}
									<span class="tag-default tag-pill">
										<i class="ion-close-round" on:click={_ => remove(i)}/>
										{tag}
									</span>
								{/each}
							</div>
						</fieldset>

						<button class="btn btn-lg pull-xs-right btn-primary" type="button" disabled={inProgress} on:click={publish}>
							Publish Article
						</button>
					</fieldset>
				</form>
			</div>
		</div>
	</div>
</div>