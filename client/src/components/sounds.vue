<template>
    <h1>Hangok</h1>
    <v-table height="40em" >
    <thead>
      <tr>
        <th class="text-left">
          Neve
        </th>
        <th class="text-left">
          Feltöltés ideje
        </th>
        <th class="text-left">
          Összes szavazat
        </th>
        <th class="text-left">
          Opciók
        </th>
      </tr>
    </thead>

    <tbody>
      <tr
        v-for="sound in sounds"
        :key="sound.name"
      >
        <td>{{ sound.name }}</td>
        <td>{{ new Intl.DateTimeFormat('hu-Hu').format(new Date(sound.createdAt)) }}</td>
        <td>{{ sound.votes }}</td>
        <td> 
          <v-btn @click="edit">Módosítás</v-btn>
        </td>
      </tr>
    </tbody>
  </v-table>
  
</template>

<script >
import axios from 'axios'

export default {
    data(){return{
       sounds: [],
    }},
    async mounted(){
        try{
        // getting sounds
        await axios({
            method: "get",
            url: import.meta.env.VITE_API_URL+"/sounds/all",
            headers: {
            // FOR NOW TOO
            Authorization: import.meta.env.VITE_API_TOKEN
            }
        }).then((response)=>{
            console.log(response)
            this.sounds =  response.data
        })
        }catch(error){
            console.log(error)
        }
    }
}
</script>

<style>

</style>