import { createRouter, createWebHistory } from 'vue-router'
import NoteoriousMain from '@/components/NoteoriousMain.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:id',
      name: 'reader',
      component : NoteoriousMain,
    },
    {
      path: '/',
      name: 'home',
      component: NoteoriousMain,
    },
  ]
})

export default router
