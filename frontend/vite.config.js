import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['balcony-scrunch-endearing.ngrok-free.dev'],
  },
})