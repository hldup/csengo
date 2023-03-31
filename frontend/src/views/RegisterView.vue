<template>
  
  <div class="background">
    <div class="circle" :class="{fade: fade}"></div>
    <div :class="{disappear: disappear}">
    <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" viewBox="0 0 100 120">
       <path fill="#9b5de5"   class="out-top" d="M37-5C25.1-14.7,5.7-19.1-9.2-10-28.5,1.8-32.7,31.1-19.8,49c15.5,21.5,52.6,22,67.2,2.3C59.4,35,53.7,8.5,37-5Z"/>
      <path fill="#00000" class="in-top" d="M20.6,4.1C11.6,1.5-1.9,2.5-8,11.2-16.3,23.1-8.2,45.6,7.4,50S42.1,38.9,41,24.5C40.2,14.1,29.4,6.6,20.6,4.1Z"/>
   </svg>

    <svg xmlns="http://www.w3.org/2000/svg"  preserveAspectRatio="xMidYMid slice" viewBox="0 0 100 110" >
    <path fill="#7000FA" class="outBottom" d="M105.9,48.6c-12.4-8.2-29.3-4.8-39.4.8-23.4,12.8-37.7,51.9-19.1,74.1s63.9,15.3,76-5.6c7.6-13.3,1.8-31.1-2.3-43.8C117.6,63.3,114.7,54.3,105.9,48.6Z"/>
      <path fill="#000000" class="in-bottom" d="M102,67.1c-9.6-6.1-22-3.1-29.5,2-15.4,10.7-19.6,37.5-7.6,47.8s35.9,3.9,44.5-12.5C115.5,92.6,113.9,74.6,102,67.1Z"/>
    </svg>
    </div>
  </div>
    <form :class="{ shake: shake , disappear: disappear}">
        <h2>Pollák</h2>
        <h6>Csengetés szavazó (Alpha 1.1.3)</h6>

        <label for="username">Felhasználó név</label>
        <input type="text" placeholder="Felhasználó név" v-model="form.username">

        <label for="password">Jelszó</label>
        <input type="password" placeholder="Jelszó" v-model="form.password">

        <label for="password">OM azonosito</label>
        <input type="text" placeholder="OM Azonosito" v-model="form.om">
        
        <button @click="register">Regisztráció</button>
        
        <p>Már van profilod? 
          <router-link to="/regisztracio">Lépj be itt</router-link>
        </p>

    </form>

</template>
<script>
export default {
    data() {
        return{
            // css triggers
            shake: false,
            disappear: false,
            fade: false,
            fadeOut: false,

            form: {
                username: "",
                password: "",
                om: "",          
            }
        }
    },
    methods: {
        register: async function(){
            if(
                !this.form.username ||
                !this.form.password ||
                !this.form.om
            ) {
                this.shake = true
                setTimeout(()=>{ this.shake = false },400)
                return
            }
            this.fade = true
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
form {
    height: 40em;
}
</style>