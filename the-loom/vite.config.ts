import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages project site: https://hooked8.github.io/CatAndMouse/the-loom/
  base: '/CatAndMouse/the-loom/',
})
