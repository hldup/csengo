<template>


<div class="background">
  
  <div class="blur-shape pink"></div>
  <div class="blur-shape purple"></div>
  <div class="blur-shape purple"></div>
  <div class="blur-shape purple"></div>
  <div class="blur-shape purple"></div>
  <div class="blur-shape light-blue"></div>
  <div class="blur-shape light-blue"></div>
  
</div>


  <router-view />
</template>

<script lang="ts" setup>
</script>
<style scoped>
body{
  background-color: black;
}
.background{
  margin: 0 auto;
  height:100vh;
  width: 100vw;
  position:absolute;
  overflow:hidden;
}

.pink{
  background:#D800A6;
}
.purple{
  background:#400D51;
}
.light-blue{
  background:#31E1F7;
}

.blur-shape{
  position:absolute;
  width: 100%;
  height: 100%;
  border-radius:50%;
  mix-blend-mode:soft-light;
  filter:blur(70px);
}

.blur-shape:nth-child(1){
  width:800px;
  height:800px;
  top:-200px;
  left:-200px;
  animation: blob 6s reverse infinite;
}

.blur-shape:nth-child(2){
  width:500px;
  height:500px;
  bottom:-80px;
  left:-90px;
  animation: blob 6s infinite 1s;
}

.blur-shape:nth-child(3){
  width:500px;
  height:500px;
  bottom:-80px;
  left:300px;
  animation: blob 6s infinite 2s;
}

.blur-shape:nth-child(4){
  width:500px;
  height:500px;
  top:-80px;
  left:500px;
  animation: blob 6s infinite reverse 3s;
}

.blur-shape:nth-child(5){
  width:500px;
  height:500px;
  bottom:-80px;
  left:-90px;
  animation: blob 6s infinite reverse 4s;
}

.blur-shape:nth-child(6){
  width:700px;
  height:700px;
  bottom:-80px;
  right:-90px;
  animation: blob 6s infinite 5s;
}

.blur-shape:nth-child(7){
  width:700px;
  height:700px;
  top:-80px;
  right:-90px;
}

@keyframes blob{
  0%{
    transform:translate(0px,0px) scale(1);
  }
  40%{
    transform:translate(100px,140px) scale(.9);
  }
  80%{
    transform:translate(-80px,40px) scale(1.1);
  }
  100%{
    transform:translate(0px,0px) scale(1);
  }
}
</style>