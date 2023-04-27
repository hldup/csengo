<template>
  <div class="background" v-if="$router.path != '/admin' " >
    <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" viewBox="0 0 120 120">
       <path fill="#9b5de5"   class="out-top" d="M37-5C25.1-14.7,5.7-19.1-9.2-10-28.5,1.8-32.7,31.1-19.8,49c15.5,21.5,52.6,22,67.2,2.3C59.4,35,53.7,8.5,37-5Z"/>
      <path fill="#00000" class="in-top" d="M20.6,4.1C11.6,1.5-1.9,2.5-8,11.2-16.3,23.1-8.2,45.6,7.4,50S42.1,38.9,41,24.5C40.2,14.1,29.4,6.6,20.6,4.1Z"/>
   </svg>
    <svg xmlns="http://www.w3.org/2000/svg"  preserveAspectRatio="xMidYMid slice" viewBox="0 0 100 100" >
    <path fill="#7000FA" class="outBottom" d="M105.9,48.6c-12.4-8.2-29.3-4.8-39.4.8-23.4,12.8-37.7,51.9-19.1,74.1s63.9,15.3,76-5.6c7.6-13.3,1.8-31.1-2.3-43.8C117.6,63.3,114.7,54.3,105.9,48.6Z"/>
      <path fill="#700FA" class="in-bottom" d="M102,67.1c-9.6-6.1-22-3.1-29.5,2-15.4,10.7-19.6,37.5-7.6,47.8s35.9,3.9,44.5-12.5C115.5,92.6,113.9,74.6,102,67.1Z"/>
    </svg>

 </div>
  
  <!-- <div class="profile" v-if="
  $route.path != '/login' && $route.path != '/register'
  " aria-label="Profil">

    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="#FFFFFF" class="bi bi-person" viewBox="0 0 16 16">
    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z"/>
    </svg>
    <div :class="show" class="popup">
      <ul>
        <li>Logout</li>
      </ul>
    </div>
  </div> -->

  <router-view />

  <footer v-if=" !['/login','/register'].includes($route.path) ">
    <a href="https://github.com/berryes/csengo" target="blank"> v{{version}}</a>
    Made with  ❤️ by <a href="https://github.com/berryes" target="blank">berryes</a>
  </footer>
 
</template>
<style scoped>

.profile{
  position: absolute;
  right: 1em;
  top: 1em;
  z-index: 3;
}
.profile svg {
  
  opacity: .5;
}
.profile:hover { 
  
  animation: hover .5s  linear normal forwards;
}
.popup{
  position: absolute;
  padding: .1em;
  text-align: center;
  top: .2em;
  right: .1em;
  border-radius: 1em;
  height: 2em;
  background-color: white;
  width: 6em;
}

@keyframes hover{
  0%{
    opacity: .5;
  }
  100%{
    opacity: 1;
  }
}
footer {
  color: white;
  position: static;
}
</style>

<style src="@/assets/css/app.css"></style>

<script>
document.title = "Csengő"
export default {
  data(){
    return{
            version: process.env.VUE_APP_VERSION,
    }
  }

}
</script>
