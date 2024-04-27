import { createRouter, createWebHistory } from 'vue-router'
import DeadlyNote from '@/components/DeadlyNote.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:id',
      name: 'reader',
      component : DeadlyNote,
    },
    {
      path: '/',
      name: 'home',
      component: DeadlyNote,
    },
  ]
})

export default router
