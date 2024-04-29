import './style.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

let isDark = localStorage.getItem('darkMode') === 'true'
document.documentElement.classList.toggle('dark', isDark)

const app = createApp(App)

app.use(router)

app.mount('#app')
