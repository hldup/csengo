<template>
	<background-vue />
	<div>
		<div class="s-container reappear" v-if="noVote">
			<h1>Jelenleg nincs szavazás :(</h1>

			<div v-if="lastWinner.length != 0">
				<h3>Előző nyertes</h3>
				<div class="soundbox" v-for="sound in lastWinner" :key="sound.id">
					<img :id="sound.id" @click="playSound(sound.id)" src="/icons/play-fill.svg" alt="Lejátszás"
						height="64" />
					<p class="soundname">{{ sound.name }}</p>
					<div class="votestats">
						<p>
							{{ sound.votes }}
							<img height="24" src="/icons/hand-thumbs-up.svg" alt="Tetszik" class="vote" />
						</p>
					</div>
				</div>
			</div>
		</div>

		<div class="container reappear" v-else>
			<!-- <countdown-vue :date="end" />  -->
			<!-- <h4> Határidő <br>{{ new Intl.DateTimeFormat('hu-Hu').format(new Date(end))  }} {{end.getHours()}}:{{end.getMinutes()}}</h4> -->
			<div class="soundbox" v-for="sound in sounds" :key="sound.id">
				<img :id="sound.id" @click="playSound(sound.id)" src="/icons/play-fill.svg" alt="Lejátszás" height="64" />
				<p class="soundname">{{ sound.name }}</p>
				<div class="votestats">
					<img v-if="uservotes.includes(sound.id)" height="32" src="/icons/hand-thumbs-up-fill.svg" alt="Tetszik"
						class="vote" @click="vote(sound)" />
					<img v-if="!uservotes.includes(sound.id)" height="32" src="/icons/hand-thumbs-up.svg" alt="Tetszik"
						class="vote" @click="vote(sound)" />
					<p>{{ sound.votes }}</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import axios from "axios";
import backgroundVue from "@/components/background.vue";
import countdownVue from "@/components/countdown.vue";
export default {
	name: "HomeView",
	components: { backgroundVue, countdownVue },
	data() {
		return {
			reapear: true,
			sounds: [],
			dataReady: false,
			soundPlaying: false,
			uservotes: [],
			audio: null,
			noVote: false,
			lastWinner: [],
			end: null,
		};
	},
	async mounted() {
		// updating every 5 seconds for "realtime" display
		await this.getSounds();
		setInterval(async () => {
			await this.getSounds();
		}, 5000);
	},
	methods: {
		vote: async function (sound) {
			try {
				if (this.uservotes.includes(sound.id)) {
					this.uservotes.splice(this.uservotes.indexOf(sound.id), 1);

					this.sounds[this.sounds.indexOf(sound)].votes -= 1;
					await axios({
						method: "post",
						url: import.meta.env.VITE_API_URL + "/sounds/devote",
						params: { id: sound.id },
						withCredentials: true,
					});
				} else {
					this.uservotes.push(sound.id);
					this.sounds[this.sounds.indexOf(sound)].votes += 1;

					await axios({
						method: "post",
						url: import.meta.env.VITE_API_URL + "/sounds/vote",
						params: { id: sound.id },
						withCredentials: true,
					});
				}
			} catch (error) {
				this.$root.promptError("Valami hiba történt szavazáskor!");
			}
		},
		playSound: async function (uuid) {
			if (this.audio != null) {
				if (!this.audio.ended) {
					document.getElementById(this.icon).src = "play-fill.svg";
					this.icon = uuid;
					this.audio.pause();
					this.audio = null;
					return;
				}
			}

			this.audio = new Audio(import.meta.env.VITE_API_URL + "/sounds/" + uuid);
			this.audio.volume = 0.2;
			this.audio.play();
			this.icon = uuid;
			document.getElementById(uuid).src = "/icons/pause-fill.svg";

			this.audio.addEventListener("ended", function () {
				document.getElementById(uuid).src = "/icons/play-fill.svg";
			});
		},
		// ugly, dont look
		getSounds: async function () {
			try {
				await axios({
					method: "GET",
					url: import.meta.env.VITE_API_URL + "/sounds",
					withCredentials: true,
					headers: {
						'Cache-Control': 'no-cache'
					}
				}).then(response => {
					if (response.status == 204 || response.status == 410) {
						this.noVote = true;
						return;
					}
					this.sounds = response.data.sounds;
					this.uservotes = response.data.user_votes;
					(this.week = response.data.week),
						(this.end = new Date(response.data.end));
					this.dataReady = true;
				});
			} catch (error) {
				if (!error.response) return;
				switch (error.response.status) {
					case 410:
						this.noVote = true;
						try {
							await axios({
								method: "get",
								url: import.meta.env.VITE_API_URL + "/weekly/winners",
								withCredentials: true,
							}).then(response => {
								this.lastWinner = response.data.sounds;
							});
						} catch (error) {
							if (!error.response) return;
						}
						break;

					case 401:
						window.$cookies.remove("Ptoken")
						this.$router.push("/login")
						break;
					default:
						break;
				}
			}
		},
	},
};
</script>
<style scoped src="@/assets/css/main.css"></style>
<style scoped>
body {
	overflow: hidden;
	background-color: black;
}

.reappear {
	animation: reappear 2s linear normal forwards;
	visibility: 0;
}

@keyframes reappear {
	0% {
		visibility: 1;
		opacity: 0;
	}

	100% {
		opacity: 1;
	}
}
</style>
