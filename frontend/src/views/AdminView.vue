<template>
  <div>
  asdasd
  </div>

</template>

<script>
import axios from 'axios'

export default {
  data(){
    return{
      sounds: []
    }
  },
  async mounted(){
      try {
        await axios({
          method: "post",
          url: (process.env.VUE_APP_SERVER_API+"/sounds/all"),
          withcredentials: true
      }).then((response)=>{
      console.log(response.code)
       this.sounds = response.data 
      })
      } catch (error) {
        console.log(error.code)   
      }
  }
}
</script>

<style>

</style>