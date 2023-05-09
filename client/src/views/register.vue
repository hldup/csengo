<template>

    <home-alert-vue   
    class="alertus"
    />
    <v-sheet class="mx-auto cs-form">
    <v-form fast-fail @submit.prevent>
      <h1>Pollák</h1>
      <h4>
        <a href="https://github.com/berryes/csengo" target="blank">
        Csengetés szavazó v{{version}}
        </a>
      </h4>
      <v-text-field
        v-model="username"
        label="Felhasználónév"
        :rules="usernameRules"
        maxlength="64"
        validate-on="blur"
      ></v-text-field>

      <v-text-field
        v-model="password"
        label="Jelszó"
        :rules="passwordRules"
        type="password"
        maxlength="64"
        validate-on="blur"
      ></v-text-field>

      <v-text-field
        v-model="omid"
        label="Om azonosító"
        :rules="omidRules"
        types="number"
        validate-on="blur"
        maxlength="11"
      ></v-text-field>

      <vue-hcaptcha @verify="captchaFill"  sitekey="a844f21a-f2be-48d3-8adc-4ebb0c7caa11"></vue-hcaptcha>

      <v-btn type="submit" block class="mt-2" @click="register" >Regisztráció</v-btn>
    </v-form>
  </v-sheet>
</template>

<script>
import VueHcaptcha from '@hcaptcha/vue3-hcaptcha';
import axios from 'axios';
import homeAlertVue from '@/components/homeAlert.vue';
  export default {
    components: { VueHcaptcha, homeAlertVue },
    data: () => ({
      version: import.meta.env.PACKAGE_VERSION,
      username: '',
      usernameRules: [
        value => {
          if (value?.length > 2) return true
          else return 'A fehasználónévnek legalább 3 karakter hosszúnak kell lennie!'
        },
        value => {
           if(value?.match(/^[a-z0-9]+$/i)) return true;
           return "A fehasználónében nem szerepelhetnek nagybetűs, speciális karakterek. (a-z, 0-9)" 
        }

      ],

      password: '',
      passwordRules: [
        value => {
          if (value?.length > 5 ) return true
          return 'A jelszónak legalább 6 karakter hosszúnak kell lennie!'
        },
      ],
      
      omid: '',
      omidRules: [
        value => {
          if (!isNaN(value) ) return true
          return 'Az om azonosítóban csak számok szerepelhetnek!'
        },
      ],
      
      hcaptchaKey: 'asd'
    }),
    methods: {
      register: async function(){
        if(
          this.username.length == 0 ||
          this.password.length == 0 ||
          this.omid.length == 0
        ){
          return
        }
          await axios({
            method: "post",
            url: import.meta.env.VITE_API_URL+"/register",
            data:{
                username: this.username,
                password: this.password,
                om: this.omid,
                hpactchaKey: this.hcaptchaKey
            }
          })
        console.log("can register")
      },
      captchaFill: function(token){ this.hcaptchaKey = token }
    }
  }
</script>


