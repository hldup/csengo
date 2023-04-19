<template>
   
    <div :class="{ shake: shake , disappear: disappear}" class="form">
        <h2>Pollák</h2>
        <h6> <a href="https://github.com/berryes/csengo" target="blank">Csengetés szavazó v{{version}} </a></h6>
        <p v-if="showError" class="error" >Hiba! lehetséges hogy elirtad a jelszavad vagy a felhasználó nevedet! </p>
        <label for="username">Felhasználó név</label>
        <input tpe="text" placeholder="Felhasználó név" v-model="form.username">

        <label for="password">Jelszó</label>
        <input type="password" placeholder="Jelszó" v-model="form.password">


        <vue-hcaptcha @verify="catptchaFilled" sitekey="a844f21a-f2be-48d3-8adc-4ebb0c7caa11" style="margin-top: 2em"></vue-hcaptcha>

        <button @click="login" style="color: black">Belépés</button>
        
        <p>Nincs még profilod? 
          <router-link to="/regisztracio">Regisztrálj itt</router-link>
        </p>

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
            version: process.env.VUE_APP_VERSION,
            form: {
                username: "",
                password: "",
                hcaptchaKey: "a"
            }
        }
    },
    methods: {
        catptchaFilled: function(token){
            this.form.hcaptchaKey = token;
        },
        login: async function(){
            if(
                this.form.username.length == 0 ||
                this.form.password.length == 0 ||
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
                await axios({
                    url: process.env.VUE_APP_SERVER_API+"/login",
                    method: "post",
                    data: this.form,
                    withCredentials: true
                })                
            } catch (error) {
                if(error.code == "ERR_BAD_REQUEST"){
                    this.showError = true
                    setTimeout(() => {
                      this.showError = false;
                    }, 2000);
                }
                
                return 
            }

            // Adding disappear class to the login form that animates it's disapperance
            this.disappear = true
            setTimeout(() => {
                if(this.form.username == "admin" ){
                    this.$router.push({path: "/admin"})
                }else{
                    this.$router.push({path: "/"})
                }           
            }, 1000);
        }
    }
}
</script>

<style scoped src="@/assets/css/login-register.css"></style>
<style scoped>

.form {
    height: 40em;
    overflow: auto;
}
.error{
    background-color: rgba(255, 0, 0, 0.177);
    border-radius: .2em;
    padding: .4em;
     animation: appear 0.6s  linear normal forwards;
}
@keyframes appear {
    0% { 
       opacity: 0; 
     }
    100% {
        opacity: 1;
    }
}

</style>
