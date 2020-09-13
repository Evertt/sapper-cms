<script>
  import { stores } from "@sapper/app"

  const { session } = stores()
  const originalFetch = process.browser && window.fetch

  $: if (originalFetch) {
    // This code wraps the browser's fetch function
    // so that it includes the CSRF token on every request.
    const csrfToken = $session.csrfToken || ""
    window.fetch = (url, options = {}) => originalFetch(url, {
      ...options,
      headers: {
        "csrf-token": csrfToken,
        ...options.headers,
      },
    })
  }
</script>