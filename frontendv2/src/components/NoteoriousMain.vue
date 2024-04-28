<script setup>
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useClipboard } from '@vueuse/core'

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

</script>

<template>
  <header class="p-6 max-w shadow-md flex items-center space-x-6 bg-[#f5f4f1]">
    <router-link to="/">
      <h1 class="font-semibold text-2xl text-[#71c4ef] hover:text-[#00668c]">Noteorious</h1>
    </router-link>
    <p class="flex-1 text-slate-300 text-xs hover:text-slate-800">Deadly Note Revived</p>
  </header>

  <div class="warning-container min-h-14 flex items-center justify-center">
    <span ref="warningElement" :style="warningStyle">
      {{ warning }}
    </span>
  </div>

  <div class="flex flex-col justify-center items-center space-y-4">
    <textarea v-model="message" rows=5 required placeholder="Type here"
      class="bg-[#f5f4f1] border-4 max-w-82 rounded-md shadow-lg resize-none focus:resize-y w-2/3 border-[#71c4ef] invalid:border-red-300 focus:invalid:border-red-500">

  </textarea>

    <div class="flex space-x-32 flex-1">

      <button @click="send()"
        class="rounded-xl p-2 shadow-md bg-violet-500 hover:bg-violet-600 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300">
        Generate
      </button>

      <button @click="copyHandler()"
        class="rounded-xl p-2 shadow-md bg-violet-500 hover:bg-violet-600 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300">
        <span v-if="!copied">Copy</span>
        <span v-else>Copied</span>
      </button>

    </div>
  </div>

  <div class="hidden">
    Current path: {{ $route.path }}
    Query: {{ $route.query }}
    Params: {{ $route.params }}
    Route: {{ $route.name }}
    Case: {{ switchCase }}
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
