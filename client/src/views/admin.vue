<template>
	<v-toolbar title="Csengő admin">
	<v-app-bar-nav-icon></v-app-bar-nav-icon>
	      <v-menu location="start">
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-dots-vertical" v-bind="props"></v-btn>
            </template>
            <v-list>
              <v-list-item>
				<v-btn @click="logout">Kijelentkezés</v-btn>
              </v-list-item>
            </v-list>
          </v-menu>

	</v-toolbar>

	<div class="kontener">
		<sounds-vue style="margin-top: 3em" />
	</div>
	<div class="kontener">
		<sessions-vue style="margin-top: 3em" />
	</div>
</template>

<script>
import soundsVue from "@/components/sounds.vue";
import sessionsVue from "@/components/sessions.vue";
import VueCookies from "vue-cookies";
export default {
	components: { soundsVue, sessionsVue },
	data() {
		return {};
	},
	methods:{
		logout: function () {
			//@ts-ignore
			VueCookies.remove("Ptoken");
			this.$router.push({ path: "/login" });
			console.log("Logged out");
		},
	}
};
</script>

<style>
body {
	background-color: white;
}

.kontener{
	margin-top: 2em;
	padding: 1em;
}
.kontener h1{
	text-align: center;
}
</style>
