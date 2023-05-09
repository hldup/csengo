<template>

  <v-card>
    <v-layout>
      <v-navigation-drawer
        v-model="drawer"
        temporary
      >
        <v-list-item title="admin" ></v-list-item>

        <v-divider></v-divider>

        <v-list density="compact" nav>
          <v-list-item prepend-icon="mdi-view-dashboard" title="Home" value="home"></v-list-item>
          <v-list-item prepend-icon="mdi-forum" title="About" value="about"></v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-main style="height: 250px">
        <div class="d-flex justify-center align-center h-100">
          <v-btn
            color="primary"
            @click.stop="drawer = !drawer"
          >
            Toggle
          </v-btn>
        </div>
      </v-main>
    </v-layout>
  </v-card>

   <v-divider
  :thickness="4"
  class="border-opacity-75"
    ></v-divider> 
    <sounds-vue />
    <v-divider
    :thickness="4"
    class="border-opacity-75"
    color="error"
    ></v-divider>
    <sessions-vue />

</template>

<script>
import soundsVue from '@/components/sounds.vue';
import sessionsVue from '@/components/sessions.vue';
export default {
  components: { soundsVue, sessionsVue },
    data(){
        return{
            // dialogs
                editSession: false,
                drawer: null,
            // for now
        }
    },

}
</script>

<style>

</style>