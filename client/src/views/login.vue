<template>
    <div class="registerpanel">
    <v-sheet width="300" class="mx-auto">
    <v-form fast-fail @submit.prevent>
      <v-text-field
        v-model="username"
        label="Felhasználónév"
        :rules="usernameRules"
      ></v-text-field>

      <v-text-field
        v-model="password"
        label="Jelszó"
        :rules="passwordRules"
        type="password"
      ></v-text-field>

      <v-text-field
        v-model="omid"
        label="Om azonosító"
        :rules="omidRules"
        types="number"
      ></v-text-field>

      <v-btn type="submit" block class="mt-2">Regisztráció</v-btn>
    </v-form>
  </v-sheet>
</div>
</template>

<script>
  export default {
    data: () => ({
      
      username: '',
      usernameRules: [
        value => {
          if (value?.length > 2) return true
          else return 'A fehasználónévnek legalább 3 karakter hosszúnak kell lennie!'
        },
        value => {
           if(value?.match(/^[a-z0-9]+$/i)) return true;
           return "A fehasználónében nem szerepelhetnek nagybetűs, speciális karakterek. (a-z, 0-9)" 
        }

      ],

      password: '',
      passwordRules: [
        value => {
          if (value?.length > 5 ) return true
          return 'A jelszónak legalább 6 karakter hosszúnak kell lennie!'
        },
      ],
      
      omid: 'as',
      omidRules: [
        value => {
          if (!isNaN(value) ) return true
          return 'Az om azonosítóban csak számok szerepelhetnek!'
        },
      ],
      
    }),
  }
</script>
<style>
body{
    color: white;
}
.registerpanel {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
}
.registerpanel input{
    background-color: rgba(128, 128, 128, 0.253);
}
</style>