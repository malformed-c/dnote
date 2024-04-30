<script setup>
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useClipboard } from '@vueuse/core'

import BrightIcon from '@/components/icons/BrightIcon.vue'
import DarkIcon from '@/components/icons/DarkIcon.vue'

const { copy, copied } = useClipboard();

const route = useRoute();
const router = useRouter();

const message = defineModel('message');

const warning = ref('');
const warningStyle = ref({});
const warningElement = ref();

const completed = ref(false)

const switchCase = defineModel('switchCase');
switchCase.value = 'setup';

const isDark = ref(localStorage.getItem('darkMode') === 'true');

const noteTitleMessages = ref([
  'Your message',
  'Type your note here',
  'Enter your text',
  'What would you like to say?',
  'Share your thoughts',
]);

const randomTitleMessage = computed(() => {
  const index = Math.floor(Math.random() * noteTitleMessages.value.length);
  return noteTitleMessages.value[index];
});


console.log('setup');

onMounted(() => {
  console.log('mounted');
  console.log(route.path, route.name);

  if (route.name === 'home') {
    console.log('home branch')
    switchCase.value = 'home';

  } else if (route.name === 'reader') {
    console.log('reader branch')
    const id = route.params.id
    const secret = route.hash.replace('#', '')

    const md5Regex = /^[a-f0-9]{32}$/;

    if (!secret) {
      showWarning('Where is the key?')
      router.push('/')
      return
    } else if (!md5Regex.test(secret)) {
      showWarning('Invalid key format. Please ensure it is a valid MD5 hash.');
      router.push('/')
      return
    }

    console.log(`id ${id} secret ${secret}`)

    axios
      .get(`api/${id}`)
      .then((resp) => {
        message.value = decrypt(resp.data, secret);
        showWarning('Here is message, only for you', 'green', false)
        router.push('/')
      })
      .catch((error) => {
        console.error(error)
        showWarning('Request failed');
        router.push('/')
      });
  }
})

function showWarning(text = 'Text is empty', color = 'LightCoral', shake = true) {
  warningStyle.value = {
    color: color,
    fontSize: 'large',
    fontWeight: 'bold',
  }

  if (shake) {
    warningElement.value.classList.add('shake')
  }

  warning.value = text;

  setTimeout(() => {
    if (shake) {
      warningElement.value.classList.remove('shake')
    }

    warning.value = '';
  },
    3000)
}

function send() {
  // TODO add validation
  if (message.value) {
    const { encrypted, secret } = encrypt(message.value)

    const payload = {
      note: encrypted,
    };

    // TODO add progress

    axios
      .post('/api', payload)
      .then((resp) => {
        message.value = `${window.location.href}${resp.data.id}#${secret}`
        showWarning('Completed', 'green', false)
        completed.value = true
      })
      .catch((err) => {
        showWarning(err)
      })

  } else {
    showWarning();
  }
}

function encrypt(data) {
  const MD5 = CryptoJS.MD5;
  const Base64 = CryptoJS.enc.Base64;
  const WordArray = CryptoJS.lib.WordArray;
  const AES = CryptoJS.AES;

  const secret = MD5(
    Base64.stringify(
      WordArray.random(32)))
    .toString();

  const encrypted = AES.encrypt(data, secret).toString();

  return {
    encrypted: encrypted,
    secret: secret
  };
}

function decrypt(data, secret) {
  const AES = CryptoJS.AES;
  const Utf8 = CryptoJS.enc.Utf8;

  const decrypted = AES.decrypt(data, secret).toString(Utf8);

  return decrypted;
}

function copyHandler() {
  if (message.value && completed.value == true) {
    copy(message.value);
    showWarning('Now go!', 'LightGreen', false)
    completed.value = false
  } else if (message.value && completed.value == false) {
    showWarning('Press Generate', 'Brown', false)
  } else {
    showWarning();
  }
}

function toggleDarkMode() {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle('dark', isDark.value);
  localStorage.setItem('darkMode', isDark.value);
  console.log('Set dark to ' + isDark.value)
}


</script>

<template>

  <div class="flex h-screen justify-center items-center bg-hint-of-red-50 text-hint-of-red-50
  dark:bg-zinc-800">

    <!-- <div class="warning-container min-h-14 flex items-center justify-center">
    <span ref="warningElement" :style="warningStyle">
      {{ warning }}
    </span>
  </div> -->

    <span class="flex flex-col">

      <div class="flex bg-primary p-3 rounded-t-lg items-center justify-between shadow-lg z-0
      dark:bg-boulder-900">
        <p class="font-semibold text-xl py-1">Noteorious - Share notes securely</p>

        <button class="" @click="toggleDarkMode()">
          <DarkIcon v-if="!isDark" />
          <BrightIcon v-else />
        </button>

      </div>


      <div class="bg-hint-of-red-50 text-hint-of-red-50 border-t-black flex flex-col p-4 justify-center items-center max-md:max-w-96 shadow-2xl rounded-t-none rounded-xl
    dark:bg-zinc-800 dark:text-slate-100">

        <textarea v-model="message" rows=6 cols=70 required placeholder="Type here" class="text-black bg-hint-of-red-100 mb-4 border-b-2 focus:border-b-primary max-w-full outline-none rounded-t-md resize-y box-border p-3
        dark:text-hint-of-red-50 dark:bg-zinc-700 dark:border-zinc-500 dark:focus:border-primary">

      </textarea>


        <div class="flex justify-end w-full">
          <Transition>
            <button v-if="!completed" @click="send()" class="rounded-lg p-2 shadow-md bg-primary hover:bg-cornflower-blue-600 active:bg-cornflower-blue-700 focus:outline-none focus:ring focus:ring-cornflower-blue-300
          text-hint-of-red-50">
              GENERATE
            </button>

            <button v-else @click="copyHandler()"
              class="rounded-lg p-2 shadow-md bg-primary hover:bg-cornflower-blue-600 active:bg-cornflower-blue-700 focus:outline-none focus:ring focus:ring-cornflower-blue-300">
              <span v-if="!copied">COPY</span>
              <span v-else>COPIED</span>
            </button>
          </Transition>
        </div>

      </div>

    </span>

  </div>

</template>

<style scoped>
@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-10px);
  }

  20%,
  40%,
  60%,
  80% {
    transform: translateX(10px);
  }
}

.shake {
  animation: shake 0.5s cubic-bezier(.36, .07, .19, .97) both;
  transform: translate3d(0, 0, 0);
}

.header {
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  padding: 5px;
  color: lightblue;
  z-index: 10;
}

.empty {
  background-color: LightCoral !important;
}

.copied {
  background-color: LightGreen !important;
}

.debug {
  display: none;
}
</style>
