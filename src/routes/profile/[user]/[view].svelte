<script context="module">
	import * as api from 'api.js';

	export async function preload(this: any, { params }: any, { user }: any) {
		const username = params.user.slice(1);

		const { profile } = await api.get(`profiles/${username}`, user && user.token);
		return { profile, favorites: params.view === 'favorites' };
	}
</script>

<script>
	import { stores } from '@sapper/app';
	import Profile from './_Profile.svelte';

	export let profile: any, favorites: boolean;
	const { session } = stores();
</script>

<svelte:head>
	<title>{profile.username} • Conduit</title>
</svelte:head>

<Profile {profile} {favorites} user={$session.user} />