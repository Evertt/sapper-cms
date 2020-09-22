<script context="module">
  export function preload(this: any, {}, { user }: any) {
    if (user) {
      this.redirect(302, `/profile/@${user.username}`)
    } else {
      this.redirect(302, `/login`)
    }
  }
</script>
