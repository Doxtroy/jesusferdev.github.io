import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // When deploying to GitHub Pages under a project site (user.github.io/repo),
  // we need to set the base path to "/repo/" so assets resolve correctly.
  // For local dev and other hosts, keep base as "/".
  base: (() => {
    const [owner, repo] = (process.env.GITHUB_REPOSITORY ?? '/').split('/')
    const isActions = !!process.env.GITHUB_ACTIONS
    const isUserOrOrgPage = !!owner && repo?.toLowerCase() === `${owner.toLowerCase()}.github.io`
    if (isActions) {
      return isUserOrOrgPage ? '/' : `/${repo}/`
    }
    return '/'
  })(),
})
