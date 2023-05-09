<template>
  <v-alert
  closable
  title="{{title}}"
  text="{{message}}"
  type="info"
    style="
    position: absolute;
    left: 50%;
    top: 6em
    "
 />

</template>

<script>
export default {
    data(){return{
        title: "Example title",
        message: "Your logins have been terminated due to the betatesting period, may i ask you to re-register with the according data bla blab bla bla somethin ghere"
    }}
}
</script>

<style>

</style>