<svelte:head>
  <title>{profile.username} • Conduit</title>
</svelte:head>

<div class="profile-page">
  <div class="user-info">
    <div class="container">
      <div class="row">
        <div class="col-xs-12 col-md-10 offset-md-1">
          <img src={profile.image} class="user-img" alt={profile.username} />
          <h4>{profile.username}</h4>
          <p>{profile.bio}</p>

          {#if isUser}
            <button on:click={signOut} class="btn btn-sm btn-outline-secondary action-btn">
              sign out
            </button>
          {:else}
            <button
              class="btn btn-sm action-btn {profile.following ? "btn-secondary" : "btn-outline-secondary"}"
              on:click={toggleFollowing}
            >
              <i class="ion-plus-round"></i>
              {profile.following ? "Unfollow" : "Follow"} {profile.username}
            </button>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<script>
  import { fbClient } from "../../../store/firebase"
  import type User from "../../../store/User"
  import { goto } from "@sapper/app"

  export let profile: User
  export let user: User

  $: isUser = user && (profile.id === user.id)

  const signOut = () => {
    fbClient.auth().signOut().then(() => {
      goto("/")
    }).catch(error => {
      console.log({ error })
    })
  }

  async function toggleFollowing() {
    if (!user) return goto("/login")

    // TODO: implement
  }
</script>
