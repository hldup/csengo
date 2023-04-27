<template>
  <div v-if="showError" class="errorPrompt">{{error}}</div>

    <div class="prompt" v-if="prompt">
      <h1>Biztosan végbe viszed ezt a müveletet?</h1>
      <div class="buttons">
        <button class="true">Igen</button>
        <button class="false">Mégsem</button>
      </div>

  </div>

  <div class="prompt soundUpload" v-if="uploadPrompt">
    <h1>Töltsön fel egy hangot</h1>
    <input type="file" ref="file" @change="fileUploaded">
    
    <h4>Adjon meg egy nevet</h4>
    <input type="text" name="hang neve" v-model="filename">

    <button @click="upload">Feltöltés</button>
    <button @click="uploadPrompt = false" style="background-color: red">Mégse</button>
  </div>
  
  <div class="prompt create" v-if="create_session_prompt">
    <h1>Hozzon létre egy szavazást</h1>
    
    <form>
      <h4 style="color: red"> Figyelem! Egy szavazás létrehozásánál az összes kijelölt hangnak szavazatai törlődni fognak!</h4>
    <label for="het">Hét </label>
    <input type="number" id="het" min="1" max="52" v-model="week"  placeholder="Hét">

    <label for="ev">Év</label>
    <input type="number" id="ev" placeholder="Év" v-model="year" >

    </form>

    <h2 style="margin-top: 1em;">Válasszon ki hangokat</h2>
      <div class="select-box">

       <div class="a-soundbox" @click=" selectSound(sound.id) " v-for="sound in sounds" :key="sound.id" :id="sound.id">
         <img :id="sound.id" @click="playSound(sound.id)" src="play-fill.svg"  alt="Lejátszás" height="64" >
         <p>{{sound.name}}</p>
      <!-- <img class="trash" src="trash.svg" alt="Torles" height="24" @click="delSound(sound)"> -->
        </div>
      </div>
 
    <button @click="createVotingSession" :disabled="session_sounds.length == 0">Letrehozas</button>
    <button @click="create_session_prompt = false" style="background-color: red">Megse</button>

  </div>



<div :class="{blur: uploadPrompt, blur: create_session_prompt}"  >
  <div class="a-container">
    <h1>Hangok</h1>  
    <div v-if="sounds.length != 0">
     <div class="a-soundbox" v-for="sound in sounds" :key="sound.id">
       <img :id="sound.id" @click="playSound(sound.id)" src="play-fill.svg"  alt="Lejátszás" height="64" >
       <p>{{sound.name}} <br> {{sound.votes}} szavazat </p>

      <!-- <img class="trash" src="trash.svg" alt="Torles" height="24" @click="delSound(sound)"> -->
     </div>
    </div>
    <div v-else  style="text-align:center">
      <h4 style="margin-top: 2em">Nincsennek hangok feltoltve</h4>
    </div>

  <button @click=" uploadPrompt = true ">Feltoltes</button>

  </div>

  <div class="a-container">
      <h1>Szavazasok ({{week}}.hét)</h1>
      <button @click="create_session_prompt = true">Letrehozas</button>
      <div v-if="votings.length != 0">
        <div v-for="vote in votings" :key="vote.id" class="votebox">
          <h3>{{vote.week}}.heti ({{vote.year}})</h3>
          Hangok:
        <div class="a-soundbox" v-for="hang in vote.sounds" :key="hang.id">
          <img :id="hang.id" @click="playSound(hang.id)" src="play-fill.svg"  alt="Lejátszás" height="64" >
          <p>{{hang.name}} <br> {{hang.votes}} szavazat </p>
        
        </div>
        <img :id="vote.id" @click="deleteSession(vote.id)" src="trash.svg" style="filter: invert(1)" alt="Lejátszás" height="32" >
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
import moment from "moment"

export default {
  data(){
    return{

      sounds: [],
      prompt: false,
      votings: [],

      // errors
      showError: false,
      error: "",

      uploadPrompt: false,
      createPropmt: false,

      // for adding sounds
      form: new FormData(),
      filename: '',
      file: undefined,

      /// for creating voting session
      session_sounds: [],
      create_session_prompt: false,
      week: moment(Date.now()).week(),
      year: moment(Date.now()).year(),

  }
  },
    async mounted(){
         // getting sounds 
        this.getSounds()
        this.getVotings()
    },
  methods:{
    errorPrompt: function(data){
      
      if(data.message.includes(409)) {this.error="Erre a napra már létezik szavazás"}
      this.showError = true;
      setTimeout(()=>{
        this.showError = false;
      },3000)
    },

    getVotings: async function(){
       try {
          await axios({
            method: "get",
            url: (process.env.VUE_APP_SERVER_API+"/weekly"),
            withCredentials: true,
        }).then((response)=>{
           this.votings = response.data;
        })
        } catch (error) {
            this.errorPrompt(error);
        }
    },
    getSounds: async function() {
     try {
          await axios({
            method: "get",
            url: (process.env.VUE_APP_SERVER_API+"/sounds/all"),
            withCredentials: true,
        }).then((response)=>{
           this.sounds = response.data;
        })
        } catch (error) {

          console.log(error)
        }
    },
    upload: async function(){
      this.form.append('sound', this.file)
      this.form.append('name',this.filename);
      try {
          await axios({
            method: "post",
            url: (process.env.VUE_APP_SERVER_API+"/sounds/add"),
            withCredentials: true,
            data: this.form
        }).then(()=>{
           this.uploadPrompt = false
           this.getSounds()
        })
        } catch (error) { 
          this.showError(error) 
        }

      this.getSounds()
      this.form = new FormData();
      this.filename = ""
    },

    showUploadPromt: function(){ this.uploadPrompt = true},
    fileUploaded: function(){
      this.file = this.$refs.file.files[0]
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
      this.audio.volume = 0.2
      this.audio.play()
      this.icon = uuid
      document.getElementById(uuid).src = "pause-fill.svg"
      
      this.audio.addEventListener("ended", function(){
          document.getElementById(uuid).src = "play-fill.svg"
       });

    },
    delSound: async function( sound ){
     console.log(sound.id)
     try {
        await axios({
          method: "post",
          url: (process.env.VUE_APP_SERVER_API+"/sounds/delete"),
          withCredentials: true,
          params: { id: sound.id }
      }).then(()=>{
        this.getSounds()
      })
      }catch (error) { 
          this.errorPrompt(error) 
    }
  },
  selectSound: function( uuid ){
    if(this.session_sounds.includes(uuid)){
      document.getElementById(uuid).style.backgroundColor = "rgba(255,255,255,0.13)"
      this.session_sounds.splice(this.session_sounds.indexOf(uuid),1)
    }else{
      document.getElementById(uuid).style.backgroundColor = "green"
      this.session_sounds.push(uuid)
    }
},


  createVotingSession: async function(){
      try {
          await axios({
            method: "post",
            url: (process.env.VUE_APP_SERVER_API+"/weekly/new"),
            withCredentials: true,
            params:{
              week: this.week,
              year: this.year,
            },
            data: {
              sounds: this.session_sounds
            }
        }).then(()=>{
          this.create_session_prompt = false;
           this.getVotings()
        })
        } catch (error) { 
          if(409 in error ){
            this.error = " Erre a hetre mar letezik szavazas"
          }
          this.errorPrompt(error)
        }
  },
  deleteSession: async function(  uuid ){
       console.log(uuid)
       try {
          await axios({
            method: "post",
            url: (process.env.VUE_APP_SERVER_API+"/weekly/delete"),
            withCredentials: true,
            params:{
              id: uuid
            },
        }).then((response)=>{
           console.log(response)
           this.getVotings()
        })
        } catch (error) { 
          console.log(error.code + "asd")
          }
        }
  },

}
</script>

<style>

</style>