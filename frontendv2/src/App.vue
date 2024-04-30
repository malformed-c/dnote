<script setup>
import { RouterView } from 'vue-router'
</script>

<template>

  <header class="hidden bg-biscay-400 text-hint-of-red-50 p-6 max-w flex items-center 
    dark:bg-boulder-900 dark:text-slate-100">

    <router-link :to="{ name: 'home' }">
      <h1 class="font-semibold text-2xl shrink text-biscay-950
      dark:text-inherit">Noteorious</h1>
    </router-link>

    <p class="text-xs scale-90 hover:text-slate-950">Deadly Note Revived</p>
    <span class="flex-1"></span>

    <button class="font-semibold hover:scale-125 transition origin-center ease-in-out" @click="toggleDarkMode()">
      Dark Mode
    </button>

  </header>

  <RouterView />
</template>

<style scoped></style>
