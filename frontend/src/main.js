import 'core-js/stable';
import 'vuetify/dist/vuetify.min.css';
import { createApp } from 'vue';
import { createVuetify } from 'vuetify';
import { createRouter, createWebHistory } from 'vue-router';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import App from './App.vue';
import DeadlyNote from './components/DeadlyNote.vue';

window.CryptoJS = CryptoJS;

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const vuetify = createVuetify({
  icons: {
    iconfont: 'md',
  },
  theme: {
    dark: false,
  },
  themes: {
    light: {
      primary: '#4682b4',
      secondary: '#b0bec5',
      accent: '#8c9eff',
      error: '#b71c1c',
    },
  },
});

const routes = [
  {
    path: '/:id',
    name: 'reader',
    component: DeadlyNote,
  },
  {
    path: '/',
    name: 'home',
    component: DeadlyNote,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);

app.use(router);
app.use(vuetify);

app.mount('#app');
