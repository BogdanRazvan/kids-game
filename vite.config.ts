import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' keeps asset paths relative so the same build works when served
// from a web host or wrapped inside a Capacitor native app.
export default defineConfig({
  base: './',
  plugins: [react()],
})
