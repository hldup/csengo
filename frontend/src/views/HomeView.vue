<template>
<div>
  
  <div class="error" v-if="showError">  Valami hiba történt! {{error}} </div>

  <div class="s-container reappear" v-if="noVote">
    <h1>Ezen a héten nincs szavazás :(  </h1>
  </div>

  <div class="container reappear" v-if="dataReady">
    <h1 class="week"> {{weekN}}. hét </h1>
       <h4 v-if=" currentWeek == weekN">
        (Ez a het)
      </h4>
      
       <h4 v-if=" currentWeek != weekN">
        ({{weekN-currentWeek}} hét múlva)
      </h4>

    <div class="soundbox" v-for="sound in sounds" :key="sound.id">
       <img :id="sound.id" @click="playSound(sound.id)" src="play-fill.svg"  alt="Lejátszás" height="64" >
       <p>{{sound.name}}</p> 
       <div class="votestats"> 
       <img v-if="uservotes.includes(sound.id)" height="32" src="hand-thumbs-up-fill.svg" alt="Tetszik" class="vote" @click="vote(sound)">
       <img  v-if="!uservotes.includes(sound.id)" height="32" src="hand-thumbs-up.svg" alt="Tetszik" class="vote" @click="vote(sound)">
       <p>{{sound.votes}}</p>
       </div>
  </div> 
  
</div>


</div>
</template>

<script>
import axios from 'axios'

// import VueCookies from 'vue-cookies';
import moment from 'moment';
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

      currentWeek: moment(Date.now()).week(),
      error: "",
      week: "",
      showError: false,      
      icon: '',
      deadline: Date.now() + 199999999,
      noVote: false,      
      
      weekN: moment(Date.now()).week()+1,
      yearN: moment(Date.now()).year(),
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
                  week: this.weekN,
                  year: this.yearN,

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
                // wish i could have used dayjs
                week: this.weekN,
                year: this.yearN,
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

    },
    getSounds: async function(){
      try{
        await axios({
            url: process.env.VUE_APP_SERVER_API+"/sounds",
            method: "get",
            withCredentials: true,
            params: {
                week: this.weekN,
                year: this.yearN,
            }
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

        // VueCookies.remove("Ptoken")
        // this.$router.push({path: "/login"})
        console.log(error)
        this.error = error;
        this.showError = true
        return
      }
    }
  },
  async mounted(){
    // updating every 4 seconds for "realtime" display
    await this.getSounds()
    setInterval(async ()=>{
      await this.getSounds()
    },10000);

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