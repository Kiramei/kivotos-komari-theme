/**
 * Resolve a public-directory asset against Vite's `base`.
 * On a Komari server base is `/`, so this is a no-op; on GitHub Pages it adds the repo sub-path.
 */
export function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
}
