import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 如果是部署到 GitHub Pages (含有 GITHUB_ACTIONS 環境變數)，則使用路徑
  // 如果是部署到 Vercel 或本地開發，則使用根目錄 '/'
  base: process.env.GITHUB_ACTIONS ? '/ClassroomManager/' : '/',
})