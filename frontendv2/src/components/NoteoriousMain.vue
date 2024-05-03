<script setup>
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { onMounted, ref, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useClipboard } from '@vueuse/core'

import BrightIcon from '@/components/icons/BrightIcon.vue'
import DarkIcon from '@/components/icons/DarkIcon.vue'

const { copy, copied } = useClipboard();
const { copy: copyKey, copied: copiedKey } = useClipboard();


const route = useRoute();
const router = useRouter();

const message = defineModel('message');
const messageElement = ref({})

const placeholder = ref('Type Here')

const disableArea = ref(false)

const infoMessage = ref('')

const keyIsMissing = ref(false)
const copiedKeyWrap = ref(false)

const completed = ref(false)
const clicked = ref(false)

const isDark = ref(localStorage.getItem('darkMode') === 'true');

const md5Regex = /^[a-f0-9]{32}$/;

let id = route.params.id

onMounted(() => {
  console.log('mounted');
  console.log(route.path, route.name);

  if (route.name === 'home') {
    console.log('home branch')

  } else if (route.name === 'reader') {
    console.log('reader branch')
    id = route.params.id
    const secret = route.hash.replace('#', '')


    router.push('/')

    if (!secret) {
      showInfo('Where is the secret?')
      keyIsMissing.value = true
      placeholder.value = 'Paste Secret Here And Press Submit'
      return

    } else if (!md5Regex.test(secret)) {
      showInfo('Invalid key format. Please ensure it is a valid MD5 hash.');
      return
    }

    getNote(id, secret)

  }
})

function getNote(id, secret) {
  axios
  .get(`api/${id}`)
  .then((resp) => {
    console.log(resp)

    message.value = decrypt(resp.data.note, secret, resp.data.hash);
    
    nextTick(() => {
      autoHeight()
    })
    
    showInfo('Here is message, only for you')
  })
  .catch((error) => {
    console.error(error)
    showInfo(error);
    message.value = ''
  })

}

function submitKey(secret) {
  secret = secret.trim()
  
  if (!md5Regex.test(secret)) {
      showInfo('Invalid key format. Please ensure it is a valid MD5 hash.');
      return
    }

    getNote(id, secret)

    keyIsMissing.value = false
    placeholder.value = 'Type Here'

}

function showInfo(text = 'Text is empty') {
  infoMessage.value = text;

  setTimeout(() => {
    infoMessage.value = '';
  }, 3000)

}

function send() {
  // TODO add validation
  clicked.value = true
  setTimeout(() => {
    clicked.value = false
  }, 1500);

  if (message.value) {
    const { encrypted, secret, hash } = encrypt(message.value)

    console.log('enc ' + encrypted + ' sec ' + secret + ' hash ' + hash)

    const payload = {
      note: encrypted,
      hash: hash
    };

    // TODO add progress

    axios
      .post('/api', payload)
      .then((resp) => {
        const URL = `${window.location.href}${resp.data.id}`
        message.value = `URI without secret: ${URL}\nSecret: ${secret}\n\n\nURL with secret: ${URL}#${secret}`
        nextTick(() => {
          autoHeight()
        })
        showInfo('Completed')
        completed.value = true
        disableArea.value = true
      })
      .catch((err) => {
        showInfo(err)
      })

  } else {
    showInfo();
  }
}

function encrypt(data) {
  const MD5 = CryptoJS.MD5;
  const SHA256 = CryptoJS.SHA256
  const Base64 = CryptoJS.enc.Base64
  const WordArray = CryptoJS.lib.WordArray
  const AES = CryptoJS.AES

  const hash = SHA256(data).toString()

  const secret = MD5(
    Base64.stringify(
      WordArray.random(32)))
    .toString()

  const encrypted = AES.encrypt(data, secret).toString()

  return {
    encrypted: encrypted,
    secret: secret,
    hash: hash
  }
}

function decrypt(data, secret, hash) {
  const AES = CryptoJS.AES;
  const Utf8 = CryptoJS.enc.Utf8;
  const SHA256 = CryptoJS.SHA256

  const decrypted = AES.decrypt(data, secret).toString(Utf8);

  if (SHA256(decrypted).toString() !== hash)
  {
    throw "Hashes isn't Equal"
  }
    
  return decrypted;
}

function copyHandler(withKey) {
  const toCopy = message.value

  console.log('Copy Handler')
  if (toCopy && completed.value == true) {
    copy(toCopy);
    showInfo('Now go!')
    message.value = ''
    copiedKeyWrap.value = false
    disableArea.value = false

    setTimeout(() => {
      completed.value = false
    }, 1500)

  } else if (toCopy && completed.value == false) {
    showInfo('Press Generate')
  } else {
    showInfo()
  }
}

function copyKeyHandler() {
  copyKey(message.value.split('#')[1].replace('#', ''))
  copiedKeyWrap.value = true
}

function toggleDarkMode() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('darkMode', isDark.value)
  console.log('Set dark to ' + isDark.value)
}

function autoHeight() {
  const element = messageElement.value
  element.style.height = 'auto'
  element.style.height = element.scrollHeight + 'px'
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

    <span class="flex flex-col max-sm:scale-75 max-md:scale-95">

      <div class="flex bg-primary p-3 rounded-t-lg items-center justify-between shadow-lg z-0
      dark:bg-boulder-900">
        <p class="font-semibold text-xl py-1">Noteorious - Share notes securely</p>

        <button class="" @click="toggleDarkMode()">
          <DarkIcon v-if="!isDark" />
          <BrightIcon v-else />
        </button>

      </div>


      <div class="bg-hint-of-red-50 text-hint-of-red-50 border-t-black flex flex-col p-4 justify-center items-center max-md:max-w-96 shadow-2xl rounded-t-none rounded-xl
    dark:bg-zinc-800 dark:text-slate-100 group">

        <textarea ref="messageElement" v-model="message" rows="6" cols="80" required :placeholder=placeholder
          class="text-black bg-hint-of-red-100 mb-4 max-w-full box-border outline-none rounded-t-md resize-y  p-3
        dark:text-hint-of-red-50 dark:bg-zinc-700 min-h-min max-h-96" :readonly="disableArea" @input="autoHeight($event)">

        </textarea>

        <span class="flex w-full flex-col">
          <span class="flex -translate-y-4 flex-row items-center">
            <span
              class="h-0.5 w-0 origin-left rounded-l bg-primary transition-all duration-300 ease-linear group-focus-within:w-full group-focus-within:rounded group-focus-within:ease-out">&nbsp;</span>
            <span
              class="w-0 transition-all origin-left duration-500 group-focus-within:animate-triwidth h-0.5 bg-blue-300 group-focus-within:rounded-full group-focus-within:scale-150">&nbsp;</span>
            <span
              class="h-px w-full origin-right rounded-l rounded-r bg-black transition-all duration-300 ease-linear group-focus-within:w-0 group-focus-within:rounded-l-none
              dark:bg-zinc-900">&nbsp;</span>
          </span>
        </span>


        <div class="flex justify-between items-center w-full">

          <div class="font-semibold text-zinc-900
          dark:text-hint-of-red-50"> {{ infoMessage }} </div>

          <Transition :duration="0">

            <button v-if="keyIsMissing" @click="submitKey(message)" class="rounded-lg p-2 shadow-md bg-primary hover:bg-cornflower-blue-600 active:bg-cornflower-blue-700 focus:outline-none focus:ring focus:ring-cornflower-blue-300
              dark:bg-zinc-600 dark:hover:bg-zinc-700 dark:active:bg-zinc-900">SUBMIT</button>

            <button v-else-if="!completed" @click="send()" class="rounded-lg p-2 shadow-md bg-primary hover:bg-cornflower-blue-600 active:bg-cornflower-blue-700 focus:outline-none focus:ring focus:ring-cornflower-blue-300
          text-hint-of-red-50
          dark:bg-zinc-600 dark:hover:bg-zinc-700 dark:active:bg-zinc-900"
              :class="{ '!bg-red-500 dark:!bg-red-800': !message && clicked, '!bg-cornflower-blue-900 dark:!bg-zinc-900': message && clicked }">
              GENERATE
            </button>

            <div v-else-if="!copied && completed" class="space-x-2">

              <button v-if="!copiedKeyWrap" @click="copyKeyHandler()" class="hidden rounded-lg p-2 shadow-md bg-primary hover:bg-cornflower-blue-600 active:bg-cornflower-blue-700 focus:outline-none focus:ring focus:ring-cornflower-blue-300
                dark:bg-zinc-600 dark:hover:bg-zinc-700 dark:active:bg-zinc-900"
                :class="{'!bg-green-600 dark:!bg-green-700': copiedKey}">
                <span v-if="!copiedKey">COPY key</span>
                <span v-else>COPIED</span>
              </button>

              <button v-else @click="copyHandler(false)" class="rounded-lg p-2 shadow-md bg-primary hover:bg-cornflower-blue-600 active:bg-cornflower-blue-700 focus:outline-none focus:ring focus:ring-cornflower-blue-300
                dark:bg-zinc-600 dark:hover:bg-zinc-700 dark:active:bg-zinc-900">
                COPY w/o key
              </button>

              <button @click="copyHandler(true)" class="rounded-lg p-2 shadow-md bg-primary hover:bg-cornflower-blue-600 active:bg-cornflower-blue-700 focus:outline-none focus:ring focus:ring-cornflower-blue-300
                dark:bg-zinc-600 dark:hover:bg-zinc-700 dark:active:bg-zinc-900">
                COPY AND ERASE
              </button>

            </div>

            <button v-else class="rounded-lg p-2 shadow-md bg-green-600 hover:bg-green-500 focus:outline-none focus:ring focus:ring-cornflower-blue-300
                dark:bg-green-700">
              COPIED
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
