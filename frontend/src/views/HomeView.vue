<template>
<div>
  <div class="background" :class="{reappear: reapear}">
    <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" viewBox="0 0 120 120">
       <path fill="#9b5de5"   class="out-top" d="M37-5C25.1-14.7,5.7-19.1-9.2-10-28.5,1.8-32.7,31.1-19.8,49c15.5,21.5,52.6,22,67.2,2.3C59.4,35,53.7,8.5,37-5Z"/>
      <path fill="#00000" class="in-top" d="M20.6,4.1C11.6,1.5-1.9,2.5-8,11.2-16.3,23.1-8.2,45.6,7.4,50S42.1,38.9,41,24.5C40.2,14.1,29.4,6.6,20.6,4.1Z"/>
   </svg>
    <svg xmlns="http://www.w3.org/2000/svg"  preserveAspectRatio="xMidYMid slice" viewBox="0 0 100 100" >
    <path fill="#7000FA" class="outBottom" d="M105.9,48.6c-12.4-8.2-29.3-4.8-39.4.8-23.4,12.8-37.7,51.9-19.1,74.1s63.9,15.3,76-5.6c7.6-13.3,1.8-31.1-2.3-43.8C117.6,63.3,114.7,54.3,105.9,48.6Z"/>
      <path fill="#700FA" class="in-bottom" d="M102,67.1c-9.6-6.1-22-3.1-29.5,2-15.4,10.7-19.6,37.5-7.6,47.8s35.9,3.9,44.5-12.5C115.5,92.6,113.9,74.6,102,67.1Z"/>
    </svg>
  </div>
  
  <div class="error" v-if="showError">  Valami hiba történt! {{error}} </div>
  

  <div class="s-container reappear" v-if="noVote">
    <h1>Ezen a héten nincs szavazás :( </h1>
  </div>

  <div class="container reappear" v-if="dataReady">
    <h1 class="week"> {{week}}. hét </h1>
    <div class="soundbox" v-for="sound in sounds" :key="sound.id">
       <img :id="sound.id" @click="playSound(sound.id)" src="play-fill.svg"  alt="Lejátszás" height="64" >
       <p>{{sound.name}}</p> 
       <img v-if="uservotes.includes(sound.id)" height="32" src="hand-thumbs-up-fill.svg" alt="Tetszik" class="vote" @click="vote(sound)">
       <img  v-if="!uservotes.includes(sound.id)" height="32" src="hand-thumbs-up.svg" alt="Tetszik" class="vote" @click="vote(sound)">
       <p>{{sound.votes}}</p>
  </div> 
  
</div>


</div>
</template>

<script>
import axios from 'axios'

import VueCookies from 'vue-cookies';
export default {
  name: 'HomeView',
  data(){
    return{
      reapear: true,
      sounds: [],
      dataReady: false,
      soundPlaying: false,
      uservotes: [],
      audio: null,

      error: "",
      week: "",
      showError: false,      
      icon: '',
      deadline: Date.now() + 199999999,
      noVote: false
}
  },
  methods:{
    vote: async function( sound ){
      try{
        if(this.uservotes.includes(sound.id)){
            this.uservotes.splice(this.uservotes.indexOf(sound.id),1)
            
            this.sounds[this.sounds.indexOf(sound)].votes -= 1;
            await axios({
                method: "post",
                url: process.env.VUE_APP_SERVER_API+"/sounds/devote",
                params: {
                  id: sound.id,
                },
                withCredentials: true,
              })  
        }
        else{
          this.uservotes.push(sound.id);
          this.sounds[this.sounds.indexOf(sound)].votes += 1;
            
          await axios({
              method: "post",
              url: process.env.VUE_APP_SERVER_API+"/sounds/vote",
              params: {
                id: sound.id,
              },
              withCredentials: true,
    
            })
        }
      }catch(error){
        console.log(error)
      }
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

    }
  },
  async mounted(){
    try{
    await axios({
        url: process.env.VUE_APP_SERVER_API+"/sounds",
        method: "get",
        withCredentials: true
    }).then((response)=>{
      
      if(response.status == 204 ){
        this.noVote = true;
        return
      }

      this.sounds = response.data.sounds
      this.uservotes = response.data.user_votes
      this.week = response.data.week, 
      this.dataReady = true 

    })
    } catch(error){

      VueCookies.remove("Ptoken")
      this.$router.push({path: "/login"})
      
      this.error = error;
      this.showError = true
      return
    }

    // updating every 4 seconds for "realtime" display
    setInterval(async ()=>{
      await axios({
          url: process.env.VUE_APP_SERVER_API+"/sounds",
          method: "get",
          withCredentials: true
      }).then((response)=>{
        if(this.noVote){this.noVote = false}
        
        if(response.status == 204){
          this.noVote = true;
           this.dataReady = false
           return
           }

        this.sounds = response.data.sounds
        this.uservotes = response.data.user_votes 
        this.week = response.data.week
        this.dataReady = true 
      })
      },4000)
  }

}
</script>
<style scoped src="@/assets/css/main.css"></style>
<style scoped>
body{
  overflow: hidden;
  background-color: black;
}

.reappear {
  animation: reappear 2s linear normal forwards;
    visibility: 0;
}
@keyframes reappear {
  
  0% { 
    visibility: 1;
      opacity: 0;

    }

    100% {
      opacity: 1;
    }
}
</style>