import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/salvatori-mathias-portfolio.github.io/',
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'  // Fix Vite 6
      }
    }
  }
})
