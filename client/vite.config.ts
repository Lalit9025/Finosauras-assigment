import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['85fd-103-37-201-223.ngrok-free.app'], // <-- add this line
    host: true, // this allows external access (important for ngrok)
    port: 5173, // optional, just to be explicit
  },
})
