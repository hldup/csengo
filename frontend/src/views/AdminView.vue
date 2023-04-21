<template>

    <div class="prompt" v-if="prompt">
      <h1>Biztosan végbe viszed ezt a müveletet?</h1>
      <div class="buttons">
        <button class="true">Igen</button>
        <button class="false">Mégsem</button>
      </div>

  </div>

  <div class="prompt" v-if="uploadPrompt">
    <h1>tolston fel egy hangot</h1>
    <input type="file" ref="file" @change="fileUploaded">
    
    <input type="text" name="hang neve" v-model="filename">

    <button @click="upload">feltoltes</button>
  </div>

<div :class="{blur: uploadPrompt, prompt: blur}"  >
  
  <div class="a-container">
    <h1>Hangok</h1>
    
    <div v-if="sounds.length > 0">
     <div class="a-soundbox" v-for="sound in sounds" :key="sound.id">
       <img :id="sound.id" @click="playSound(sound.id)" src="play-fill.svg"  alt="Lejátszás" height="64" >
       <p>{{sound.name}} <br> {{sound.votes}} szavazat </p>
      
      <img class="trash" src="trash.svg" alt="Torles" height="24" @click="delSound(sound)">
     </div>
    </div>
    <div v-else  style="text-align:center">
      <h4 style="margin-top: 2em">Nincsennek hangok feltoltve</h4>
    </div>
  
  <button @click="feltoltesPrompt">Feltoltes</button>
  </div>

  <div class="a-container">
      <h1>Szavazasok</h1>
      <button @click="feltoltesPrompt">Letrehozas</button>
      
      <div v-if="votings.length > 0">
        <div v-for="vote in votings" :key="vote.id">
          <h3>{{vote.week}}.heti ({{vote.year}})</h3>
          Hangok:
        
        <div class="a-soundbox" v-for="sound in vote.sounds" :key="sound.id">
          <img :id="sound.id" @click="playSound(sound.id)" src="play-fill.svg"  alt="Lejátszás" height="64" >
          <p>{{sound.name}} <br> {{sound.votes}} szavazat </p>
        </div>
      </div>  
    </div>

    <div v-else>
      <h4 style="margin-top: 2em">Nincsennek szavaszasok letrehozva</h4>
    </div>

  </div>

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
      votings: [],
      uploadPrompt: false,
      
      form: new FormData(),
      filename: '',
      file: undefined

    }
  },
    async mounted(){
        // getting sounds
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
      // getting voting sessions
      try {
          await axios({
            method: "get",
            url: (process.env.VUE_APP_SERVER_API+"/weekly"),
            withCredentials: true
        }).then((response)=>{
           this.votings = response.data
        })

        }catch (error) { 
          this.error = error
          console.log(error.code + "asd")
        }


    },
  methods:{
    upload: async function(){
      this.form.append('sound', this.file)
      this.form.append('name',this.filename);

      try {
          await axios({
            method: "post",
            url: (process.env.VUE_APP_SERVER_API+"/sounds/add"),
            withCredentials: true,
            data: this.form
        }).then((response)=>{
           this.votings = response.data
        })

        }catch (error) { 
          this.error = error
          console.log(error.code + "asd")
        }


      
    },
    fileUploaded: function(){

      this.file = this.$refs.file.files[0]
      console.log(this.file)
    },

    feltoltesPrompt: async function(){
      this.uploadPrompt = true;
      
    },

    triggerRefresh: function(){
      this.dataReady = false;
      this.dataReady = true;
    },
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
    delSound: async function( sound ){
     try {
        await axios({
          method: "post",
          url: (process.env.VUE_APP_SERVER_API+"/sounds/delete"),
          withCredentials: true,
          params: { id: sound.id}
      }).then(()=>{
          this.sounds.slice(
            this.sounds.indexOf(sound),
            1
          )
          this.triggerRefresh()
      })

      }catch (error) { 
        console.log(error.code + "asd")
    }
  },
}
}
</script>

<style>

</style>