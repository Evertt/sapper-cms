<nav class="navbar navbar-light">
  <div class="container">
    <a sapper:prefetch class="navbar-brand" href=".">conduit</a>
    <ul class="nav navbar-nav pull-xs-right">
      <li class="nav-item">
        <a sapper:prefetch class="nav-link" class:active={$page.path === "/"} href="/">Home</a>
      </li>

      <li class="nav-item">
        <a sapper:prefetch class="nav-link" class:active={$page.path === "/content"} href="/content">Content</a>
      </li>

      {#if $session.user}
        <li class="nav-item">
          <a sapper:prefetch href="/editor" class="nav-link" class:active={$page.path === "/editor"}>
            <i class="ion-compose"></i>&nbsp;New Post
          </a>
        </li>

        <li class="nav-item">
          <a sapper:prefetch href="/settings" class="nav-link" class:active={$page.path === "/settings"}>
            <i class="ion-gear-a"></i>&nbsp;Settings
          </a>
        </li>

        <li class="nav-item">
          <a sapper:prefetch href="/profile/@{$session.user.username}" class="nav-link">
            <!-- <img src={$user.image} class="user-pic" alt={$user.username}> -->
            {$session.user.username}
          </a>
        </li>
      {:else}
        <li class="nav-item">
          <a sapper:prefetch href="/login" class="nav-link" class:active={$page.path === "/login"}>
            Sign in
          </a>
        </li>

        <!-- <li class="nav-item">
          <a sapper:prefetch href="/register" class="nav-link" class:active={$page.path === "/register"}>
            Sign up
          </a>
        </li> -->
      {/if}
    </ul>
  </div>
</nav>

<script>
  import { stores } from "@sapper/app"

  const { page, session } = stores()
</script>
