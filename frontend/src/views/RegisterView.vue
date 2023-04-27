<template>
<div class="register">

    <div :class="{ shake: shake , disappear: disappear}" class="form">
        <h2>Pollák</h2>
        <h6> <a href="https://github.com/berryes/csengo" target="blank">Csengetés szavazó v{{version}} </a></h6>
        <p>Csak pollákos diákok regisztrálhatnak!</p>
        <p v-if="showError" class="error" >{{error}}</p>
        <label for="username">Felhasználó név</label>
        <input tpe="text" placeholder="Felhasználó név" v-model="form.username">

        <label for="password">Jelszó</label>
        <input type="password" placeholder="Jelszó" v-model="form.password">

        <label for="password">OM azonosito</label>
        <input type="number" placeholder="OM Azonosito" v-model="form.om">

        <vue-hcaptcha @verify="catptchaFilled" sitekey="a844f21a-f2be-48d3-8adc-4ebb0c7caa11" style="margin-top: 2em"></vue-hcaptcha>

        <button @click="register" style="color: black">Regisztráció</button>
        
        <p>Már van profilod? 
          <router-link to="/login">Lépj be itt</router-link>
        </p>

    </div>

</div>
</template>
<script>
import VueHcaptcha from '@hcaptcha/vue3-hcaptcha';
import axios from "axios";
export default {
    components: { VueHcaptcha },
    data() {
        return{
            // css triggers
            shake: false,
            disappear: false,
            fadeOut: false,
            showError: false,
            error: "",
            version: process.env.VUE_APP_VERSION,
            form: {
                username: "",
                password: "",
                om: "",
                hcaptchaKey: ""
            }
        }
    },
    methods: {
        catptchaFilled: function(token){
            this.form.hcaptchaKey = token;
        },
        register: async function(){
            if(
                this.form.username.length == 0 ||
                this.form.password.length == 0 ||
                this.form.om.length == 0 || 
                this.form.hcaptchaKey.length == 0
            ) {
                this.shake = true
                setTimeout(()=>{ this.shake = false },400)
                return
            }
            // error handeling
            try {
                // await axios.post(`${process.env.VUE_APP_SERVER_API}/register`,this.form).then((response)=>{
                //    console.log(response.headers)
                // })
                this.form.om = this.form.om.toString()
                await axios({
                    url: process.env.VUE_APP_SERVER_API+"/register",
                    method: "post",
                    data: this.form,
                    withCredentials: true
                })                
            } catch (error) {
                this.form.hcaptchaKey = ""
                
                switch(error.code){
                    case "ERR_BAD_REQUEST":
                        this.error = "Hiba! Lehetséges hogy ezzel a felhasználónévvel vagy OM azonosítóval már valaki regisztrált vagy elírtad!" 
                        this.showError = true
                    break;

                    case "ERR_NETWORK":
                        this.error = "Hiba! Nem lehet a szervert elérni!" 
                        this.showError = true 
                    break;

                }
                setTimeout(() => { this.showError = false    }, 10000);
                return 
            }

            this.disappear = true
            setTimeout(() => {
                this.$router.push({path: "/"})
            }, 1000);
        }
    }
}
</script>

<style src="@/assets/css/login-register.css"></style>
<style scoped>
.form {
    height: 46em;
    overflow:auto;
}
.error{
    background-color: rgba(255, 0, 0, 0.177);
    border-radius: .2em;
    padding: .4em;
     animation: appear 10s  linear normal forwards;
}
@keyframes appear {

    0% { 
       opacity: 0; 
     }
    5% {
        opacity: 1;
     }
     80%{
        opacity: 1;
     }

    100% {
        opacity: 0;
        visibility: 0;
    }
}

</style>
