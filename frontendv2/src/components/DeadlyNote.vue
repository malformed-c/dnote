<script setup>
</script>

<template>
  <div class="main">
    <h1 class="blue">Deadly Note</h1>
  </div>
</template>

<script>
import axios from 'axios';
import CryptoJS from 'crypto-js';

const api = '/notes';
let secret = '';
const urlHash = '#';

export default {
  name: 'DeadlyNote',
  data() {
    return {
      message: '',
      form: false,
      email: '',
      numberOfViews: '1',
      noteLabel: 'Type here',
      showOptions: false,
      validOptions: false,
      valid: false,
      completed: false,
      errors: [],
      urlEncoded: '',
      showAlert: false,
      alertType: 'info',
      alertContent: '',
    };
  },
  mounted() {
    if (typeof this.$route.params.id !== 'undefined') {
      this.noteLabel = '';
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
h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
