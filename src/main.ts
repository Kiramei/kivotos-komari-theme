import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { setupIconify } from '@/utils/iconify'
import { message } from '@/utils/message'
import App from './App.vue'
import router from './router'

import './styles/main.css'

window.$message = message

setupIconify().catch((err) => {
  console.warn('[main] iconify init failed', err)
})

async function bootstrap(): Promise<void> {
  if (import.meta.env.VITE_DEMO === '1')
    await import('./demo/mock')

  const pinia = createPinia()
  const app = createApp(App)

  app.use(pinia)
  app.use(router)

  app.mount('#app')
}

void bootstrap()
