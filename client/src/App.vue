<template>

	<!--  basic profile prompt to log out -->
	<div
		class="text-center profile-options"
		v-if="!['/login','/admin','/register'].includes($route.path)
		 "
	>
		<v-menu open-on-hover open-on-click>
			<template v-slot:activator="{ props }">
				<img src="/icons/person.svg" alt="profil" v-bind="props" height="48" />
			</template>
			<v-list>
				<v-list-item>
					<v-list-item-title @click="logout">
						<v-btn variant="text" @click="menu = false"> Kijelentkezés </v-btn>
					</v-list-item-title>
				</v-list-item>
			</v-list>
		</v-menu>
	</div>

	<!-- router -->
	<router-view />
</template>

<script>
import VueCookies from "vue-cookies";
export default {
	computed() {
		return {
			cache: false,
		};
	},
	data(){return{
		notice: false,
	}},
	mounted(){
		if(!VueCookies.get("notice")){
			this.notice = true;
		}
	},
	methods: {
		logout: function () {
			//@ts-ignore
			VueCookies.remove("Ptoken");
			this.$router.push({ path: "/login" });
			console.log("Logged out");
		},
	},
};
</script>

<style>
body {
	background-color: black;
}
</style>
