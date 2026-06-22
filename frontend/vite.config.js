// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // 🎯 FIXED: Correct standard import name

export default defineConfig({
  plugins: [
    react()
  ]
});