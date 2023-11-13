<template>
	<background-vue />

	<v-sheet class="mx-auto cs-form">

		<v-form fast-fail @submit.prevent>
			<h1>Pollák</h1>
			<h4>
				<a href="https://github.com/hldup/csengo" target="blank">
					Csengetés szavazó v{{ version }}
				</a>
			</h4>
			<p v-if="showError" style="margin-top: 1em; color: red">{{ error }}</p>
			<v-text-field v-model="username" label="Felhasználónév" :rules="usernameRules" maxlength="64"></v-text-field>

			<v-text-field v-model="password" label="Jelszó" type="password" maxlength="64"></v-text-field>

			<vue-hcaptcha @verify="captchaFill" sitekey="a844f21a-f2be-48d3-8adc-4ebb0c7caa11"></vue-hcaptcha>

			<v-btn type="submit" block class="mt-2" @click="register">Bejelentkezés</v-btn>
			<p style="margin-top: 1em">
				Nincs még profilod?
				<a href="/register"> Regisztrálj itt!</a>
			</p>
		</v-form>
	</v-sheet>
</template>

<script>
import VueHcaptcha from "@hcaptcha/vue3-hcaptcha";
import axios from "axios";
import homeAlertVue from "@/components/homeAlert.vue";
import backgroundVue from "@/components/background.vue";
export default {
	components: { VueHcaptcha, homeAlertVue, backgroundVue },
	data: () => ({
		showError: false,
		error: "",

		version: import.meta.env.PACKAGE_VERSION,
		username: "",
		usernameRules: [
			value => {
				if (value?.length > 2) return true;
				else
					return "A fehasználónévnek legalább 3 karakter hosszúnak kell lennie!";
			},
			value => {
				if (value?.match(/^[a-z0-9]+$/i)) return true;
				return "A fehasználónében nem szerepelhetnek nagybetűs, speciális karakterek. (a-z, 0-9)";
			},
		],

		password: "",
		hcaptchaKey: "",
	}),
	mounted() {
		if (import.meta.env.VITE_DEV) this.hcaptchaKey = "asd"
	},
	methods: {
		register: async function () {
			try {
				await axios({
					method: "post",
					url: import.meta.env.VITE_API_URL + "/login",
					withCredentials: true,
					data: {
						username: this.username,
						password: this.password,
						hcaptchaKey: this.hcaptchaKey,
					},
				});
			} catch (error) {
				if (!error.response) {
					this.error = "Nem lehet elérni a szervert!";
					this.showError = true;
					return;
				}
				switch (error.response.status) {
					case 401:
						this.error =
							"Hibás adatok! Lehetséges hogy erlírtad a felhasználóneved vagy a jelszavad!";
						break;
					default:
						this.error = "Valami hiba történt a belépéskor!";
						break;
				}
				this.showError = true;
				return;
			}
			if (this.username == "admin")
				return this.$router.push({ path: "/admin" });
			this.$router.push({ path: "/" });

		},
		captchaFill: function (token) {
			this.hcaptchaKey = token;
		},
	},
};
</script>
