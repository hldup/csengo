<template>
    <h1>Szavazások</h1>
      <v-table
    height="40em"
    >
    <thead>
      <tr>
        <th class="text-left">
          Kezdés
        </th>
        <th class="text-left">
          Végzés
        </th>
        <th class="text-left">
          Eddigi szavazatok
        </th>
        <th class="text-left">
          Opciók
        </th>
      </tr>
    </thead>

    <tbody>
      <tr
        v-for="session in sessions"
        :key="session.id"
      >
        <td>{{ new Intl.DateTimeFormat('hu-Hu').format(new Date(session.start)) }}</td>
        <td>{{ new Intl.DateTimeFormat('hu-Hu').format(new Date(session.end)) }}</td>
        <td>{{ session.sounds.reduce((accum,item) => accum + item.votes, 0) }}</td>
        <td>
        <v-btn @click="editSession"> Módosítás </v-btn>    
        </td>
      </tr>
    </tbody>
       <template v-slot:activator="{ props }">
        <v-btn
          color="primary"
          v-bind="props"
        >
          Open Dialog
        </v-btn>
      </template>


 </v-table>
    
</template>

<script>
import axios from 'axios'
export default {

    data(){return{
        sessions: [],
        
    }},
    async mounted(){
        // getting voting sessions
        await axios({
            method: "get",
            url: import.meta.env.VITE_API_URL+"/weekly",
            headers: {
                // FOR NOW TOO
            Authorization: import.meta.env.VITE_API_TOKEN
            }
        }).then((response)=>{
            this.sessions =  response.data
        })
    }
}
</script>

<style>

</style>