<script setup>
import { onMounted, ref } from 'vue';
import { RouterView } from 'vue-router'

const isDark = ref(localStorage.getItem('darkMode') === 'true');
document.documentElement.classList.toggle('dark', isDark.value);

console.log('Dark setup ' + isDark.value)

isDark.value = localStorage.getItem('darkMode')
console.log('Dark ' + isDark.value)

function toggleDarkMode() {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle('dark', isDark.value);
  localStorage.setItem('darkMode', isDark.value);
  console.log('Set dark to ' + isDark.value)
}

</script>

<template>

  <header class="p-6 max-w shadow-xl flex items-center space-x-4 max-md:space-x-2 bg-thunder-950">
    <router-link :to="{ name: 'home' }">
      <h1 class="font-semibold text-2xl text-[#71c4ef] hover:text-[#00668c]">Noteorious</h1>
    </router-link>
    <p class="flex-1 text-slate-300 text-xs hover:text-slate-800">Deadly Note Revived</p>
    <button class="dark:text-slate-100" @click="toggleDarkMode()">Dark Mode</button>
  </header>

  <RouterView />
</template>

<style scoped></style>
