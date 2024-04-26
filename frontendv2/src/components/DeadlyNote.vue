<script setup>
import axios from 'axios';
import CryptoJS from 'crypto-js';
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
    <button color="green">Generate</button>
    <button color="blue">Copy and Erase</button>
  </div>
  </div>
  <div class="debug">
    Current path: {{ $route.path }}
    Query: {{ $route.query }}
    Params: {{ $route.params }}
  </div>
</template>

<script>
const api = '/notes';
let secret = '';
const urlHash = '#';

export default {
  name: 'DeadlyNote',
  
  mounted() {
    if (typeof this.$route.params.id !== 'undefined') {
      const params = this.$route.params.id.split(urlHash);
      secret = window.location.hash.replace('#', '');
      axios
        .get(`${api}/${params[0]}`)
        .then((response) => {
          this.message = this.decrypt(response.data);
          this.completed = true;
          this.$router.push('/');
        })
        .catch(() => {
          this.showAlertNotFound();
          this.$router.push('/');
        });
    }
  },
  methods: {
    clearForm() {
      this.$refs.form.reset();
    },
    send(e) {
      e.preventDefault();
      if (this.$refs.form.value.validate()) {
        this.noteLabel = '';

        const payload = {
          note: this.encrypt(this.message),
          numberOfViews: parseInt(this.numberOfViews, 10),
          email: this.email,
        };
        axios
          .post(api, payload)
          .then((response) => {
            this.completed = true;
            this.clearForm();
            this.message = `${window.location.href}${response.data.id}${urlHash}${secret}`;
          })
          .catch((response) => {
            this.showAlert = true;
            this.alertContent = response.message;
            this.alertType = 'error';
          });
      }
    },
    encrypt() {
      secret = CryptoJS.MD5(
        CryptoJS.enc.Base64.stringify(CryptoJS.lib.WordArray.random(32)),
      ).toString();
      return CryptoJS.AES.encrypt(this.message, secret).toString();
    },
    decrypt(encrypted) {
      return CryptoJS.AES.decrypt(encrypted, secret).toString(
        CryptoJS.enc.Utf8,
      );
    },
    showAlertNotFound() {
      this.showAlert = true;
      this.alertContent = 'Oops, seems that this note never existed or it was already viewed.';
      this.alertType = 'error';
    },
    copy() {
      const testingCodeToCopy = document.querySelector('#messageContent');
      testingCodeToCopy.select();
      document.execCommand('copy');
      window.getSelection().removeAllRanges();
      this.noteLabel = 'Type here';
      this.clearForm();
      this.completed = false;
    },
  },
};
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  padding: 5px;
}

.main {
  display: grid;
  place-items: center;
  gap: 20px;
}

.main textarea {
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

</style>
