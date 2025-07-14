import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
<<<<<<< HEAD
      '/api': 'https://content-generation-webapp-server.onrender.com'
=======
      '/api': 'https://content-generation-webapp-server.onrender.com/'
>>>>>>> 3a6605b (moved logo to public)
    }
  }
})
