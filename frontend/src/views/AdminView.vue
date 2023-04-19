<template>
    <div class="prompt" v-if="prompt">
      <h1>Biztosan végbe viszed ezt a müveletet?</h1>
      <div class="buttons">
        <button class="true">Igen</button>
        <button class="false">Mégsem</button>
      </div>

  </div>
  <div class="a-container">
    <h1>Hangok</h1>

     <div class="soundbox" v-for="sound in sounds" :key="sound.id">
       <img :id="sound.id" @click="playSound(sound.id)" src="play-fill.svg"  alt="Lejátszás" height="64" >
       <p>{{sound.name}} <br> {{sound.votes}} szavazat </p>
      
      <img class="trash" src="trash.svg" alt="Torles" height="24" @click="delSound(sound.id)">

  </div> 

  </div>
  <div class="a-container">
  
  </div>

</template>

<style scoped src="@/assets/css/admin.css"></style>
<style>
body{
  background-color: black;
  
}
</style>

<script>
import axios from 'axios'

export default {
  data(){
    return{
      sounds: [],
      error: '',
      prompt: false,

    }
  },
  methods:{
  playSound: async function( uuid ){
      if(this.audio != null ){ 
        if(!this.audio.ended) {
           document.getElementById(this.icon).src = "play-fill.svg"
           this.icon = uuid;
           this.audio.pause()
           this.audio = null;
            return
        }
      }

      this.audio = new Audio(process.env.VUE_APP_SERVER_API+"/sounds/"+uuid)
      this.audio.play()
      this.icon = uuid
      document.getElementById(uuid).src = "pause-fill.svg"
      
      this.audio.addEventListener("ended", function(){
          document.getElementById(uuid).src = "play-fill.svg"
       });

    },
    delSound: async function( uuid ){
      
    }
  },
  async mounted(){
    try {
        await axios({
          method: "get",
          url: (process.env.VUE_APP_SERVER_API+"/sounds/all"),
          withCredentials: true

      }).then((response)=>{
         this.sounds = response.data 
      })

      }catch (error) { 
        this.error = error
        console.log(error.code + "asd")

      }
  }
}
</script>

<style>

</style>