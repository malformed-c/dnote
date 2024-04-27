<script setup>
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useClipboard } from '@vueuse/core'

const { copy, copied } = useClipboard()

const completed = defineModel('completed')

const showAlert = defineModel('showAlert')
const alertContent = defineModel('alertContent')

const route = useRoute();

const message = defineModel('message');

const switchCase = defineModel('switchCase');
switchCase.value = 'setup'

console.log('setup')

onMounted(() =>
{
  console.log('mounted')
  console.log(route.path, route.name)

  if (route.name === 'home')
  {
    console.log('home branch')
    switchCase.value = 'home';

  } else if (route.name === 'reader') {
    console.log('reader branch')
    const params = route.params.id.split('#');
      const secret = params[1];

      axios
        .get(`notes/${params[0]}`)
        .then((resp) => {
          message.value = decrypt(resp.data, secret);
          completed.value = true;
          this.$router.push('/');
        })
        .catch(() => {
          showAlertNotFound();
          this.$router.push('/');
        });
  }
})

function showAlertNotFound() {
  console.error('not implemented')
}

function send() {
  // TODO add validation
  if (message.value) {
    const {encrypted, secret} = encrypt(message.value)

    const payload = {
      note: encrypted,
    };

    message.value = encrypted;

    axios
    .post('/notes', payload)
    .then((resp) => {
      completed.value = true;
      message.value = `${window.location.href}${resp.data.id}#${secret}`
    })
    .catch((resp) => {
      showAlert.value = true;
      alertContent.value = resp.message;
    })
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

</script>

<template>
  <header class="header">
    <h1 color="blue">Deadly Note</h1>
  </header>

  <div class="main">
    <textarea
    v-model="message"
    rows="5"
    id="messageContent"
    required
    placeholder="Type here"
    >

  </textarea>
    <div class="buttons">

      <button @click="send()"
      :style="{ empty: !message }">
        Generate
      </button>

      <button @click="copy(message)"
      :class="{ copied: copied }">
        <span v-if="!copied">Copy</span>
        <span v-else>Copied</span>
      </button>

    </div>
  </div>

  <div class="debug">
    Current path: {{ $route.path }}
    Query: {{ $route.query }}
    Params: {{ $route.params }}
    Route: {{ $route.name }}
    Case: {{ switchCase }}
  </div>

</template>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  padding: 5px;
  color: lightblue;
  z-index: 10;
}

.main {
  display: flex;
  flex-direction: column;
  place-items: center;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 60px;
}

.main textarea {
  min-width: 50vw;
  width: 80%;
  height: fit-content;
  padding: 10px;
  border: 3px solid blue;
  border-radius: 5px;
}

.buttons {
  display: flex;
  gap: 10vh;
  height: 35px;
  width: auto;
}

.buttons button {
  background-color: yellow;
}

.empty {
  background-color: red !important;
}

.copied {
  background-color: green !important;
}

.debug {
  display: none;
}

</style>
