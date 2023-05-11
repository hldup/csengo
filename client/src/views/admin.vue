<template>



    <sounds-vue  style="margin-top: 3em;"/>
    
    <sessions-vue style="margin-top: 3em;" />

</template>

<script>
import soundsVue from '@/components/sounds.vue';
import sessionsVue from '@/components/sessions.vue';
export default {
  components: { soundsVue, sessionsVue },
    data(){
        return{
        }
    },

}
</script>

<style >
body{
    background-color: white;
}
</style>
