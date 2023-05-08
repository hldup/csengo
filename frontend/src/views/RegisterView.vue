<template>
<div class="register">

    <div :class="{ shake: shake , disappear: disappear}" class="form">
        <h2>Pollák</h2>
        <h6> <a href="https://github.com/berryes/csengo" target="blank">Csengetés szavazó v{{version}} </a></h6>
        <p>Csak pollákos diákok regisztrálhatnak!</p>

        <label for="username">Felhasználó név</label>
        <input type="text" placeholder="Felhasználó név" 
        v-model="form.username" minlength="3" maxlength="64" id="username" >

        <label for="password">Jelszó</label>
        <input type="password" placeholder="Jelszó" 
        v-model="form.password" minlength="3" maxlength="64" id="password">
        <label for="password"></label>

        <label for="omazonosito">OM azonosító</label>
        <input type="number" name="omazonosito"  placeholder="OM azonosító" id="omazonosito" v-model="form.om" >

        <vue-hcaptcha @verify="catptchaFilled" sitekey="a844f21a-f2be-48d3-8adc-4ebb0c7caa11" style="margin-top: 2em"></vue-hcaptcha>
        <button @click="register" type="submit" style="color: black">Regisztráció</button>

        <p>Már van profilod? 
          <router-link to="/login">Lépj be itt</router-link>
        </p>
        <p><a href="https://berryez.xyz/privacy" target="blank">Adatvédelem</a></p>
        
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
            error: "",
            version: process.env.VUE_APP_VERSION,
            form: {
                username: "",
                password: "",
                om: "",
                hcaptchaKey: ""
            },
            fields: {
                username: document.getElementById("username"),
                password: document.getElementById("password"),
                omazonosito: document.getElementById("omazonosito"),
            }
        }
    },
    mounted(){
        if(process.env.VUE_APP_DEV == "1"){
            this.form.hcaptchaKey = "filltext"
        }
    }, 
    methods: {
        showFieldError( field, error ){
            console.log("showing error")
            field.setCustomValidity(error);
            field.reportValidity()
        },
        catptchaFilled: function(token){
            this.form.hcaptchaKey = token;
        },
        register: async function(){
            // checking for empty fields
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
            // validating fields
            if(!this.form.username.match('/((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+[0-9a-z]+$/i'))
            return this.showFieldError(this.fields.username, "A felhasznalonev nem tartalmazhat csak alphanumerikus karaktereket! (a-z 0-9)")

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
                        this.$root.errorPrompt("Hiba! Lehetséges hogy ezzel a felhasználónévvel vagy OM azonosítóval már valaki regisztrált vagy elírtad!") 
                    break;
                    case "ERR_NETWORK":
                        this.$root.errorPrompt("Hiba! Nem lehet a szervert elérni!") 
                    break;

                }
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

</style>
