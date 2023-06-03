<template>
	<h1>Szavazások</h1>
	<v-table fixed-header >
		<thead>
			<tr>
				<th class="text-left">Státusz</th>
				<th class="text-left">Kezdés</th>
				<th class="text-left">Végzés</th>
				<th class="text-left">Eddigi szavazatok</th>
				<th class="text-left">Opciók</th>
			</tr>
		</thead>

		<tbody>
			<tr v-for="session in sessions" :key="session.id">
			<td>-</td>

				<td>
					{{
						new Date(session.start).toLocaleDateString("hu-Hu",{
								second: 'numeric',
								hour: 'numeric',
								minute: 'numeric'
							})
						 }}
	
				</td>
				<td>
					{{
						new Date(session.end).toLocaleDateString("hu-Hu",{
								second: 'numeric',
								hour: 'numeric',
								minute: 'numeric'
							})
						 }}
				</td>
				<td>
					{{ session.sounds.reduce((accum, item) => accum + item.votes, 0) }}
				</td>
				<td>
					<v-btn @click="editSession(session)" disabled> Módosítás </v-btn>
				</td>
				<td>
					<v-btn color="error" @click="del(session)"> Törlés </v-btn>
				</td>
			</tr>
		</tbody>
		<template v-slot:activator="{ props }">
			<v-btn color="primary" v-bind="props"> Open Dialog </v-btn>
		</template>
	</v-table>

	<div class="text-center">
		<v-dialog v-model="createSession" width="auto">
			<template v-slot:activator="{ createPrompt }">
				<v-btn
					color="primary"
					v-bind="createPrompt"
					@click="
						selectedSounds = [];
						start= '';
						end= '';
						createSession = true
					"
				>
					Létrehozás
				</v-btn>
			</template>

			<v-card style="padding: 2em" v-if="createPrompt">
				<h1>Létrehozás</h1>
				<v-sheet width="300" class="mx-auto">
					<v-form @submit.prevent>
						<v-text-field
							v-model="start"
							:rules="rules"
							label="Kezdés"
							type="datetime-local"
						></v-text-field>

						<v-text-field
							v-model="end"
							:rules="rules"
							label="Végzés"
							type="datetime-local"
						></v-text-field>

						<v-select
							v-model="selectedSounds"
							:items="sounds"
							item-title="name"
							item-value="id"
							:rules="rules"
							label="Hangok"
							multiple
							persistent-hint
						></v-select>

						<v-btn type="submit" block class="mt-2" @click="create" >Létrehozás</v-btn>
						<v-btn type="submit" color="error" block class="mt-2" @click="createSession = false" >Mégse</v-btn>
					</v-form>
				</v-sheet>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import axios from "axios";
export default {
	data: () => ({
		sessions: [],
		createSession: false,
		sounds: [],
		createPrompt: true,

		start: "",
		end: "",
		selectedSounds: [],
		rules: [
			value => {
				if (value) return true;
				return "Adjon meg adatot!";
			},
		],
	}),

	async mounted() {
		await this.getSessions();
		await this.getSounds();
		setInterval(async () => {
			await this.getSessions();
		}, 5000);
	},
	
	methods: {
		getSessions: async function () {
			try{
			await axios({
				method: "get",
				url: import.meta.env.VITE_API_URL + "/weekly",
				withCredentials: true,
			}).then(response => {
				this.sessions = response.data;
			});
			}catch(error){
				console.log(error)
			}
		},
		getSounds: async function () {
			try{
				await axios({
					method: "get",
					url: import.meta.env.VITE_API_URL + "/sounds/all",
					withCredentials: true,
				}).then(response => {
					console.log("hangok", response.data);
					this.sounds = response.data;
				});
			}catch(error){
				console.log("Failed to get sounds")
			}
		},

		edit: function (session) {
			// todo fix date
			console.log("start", session.start);
			this.start = new Date(session.start).toISOString();
			this.end = new Date(session.end).toISOString();
			for (let sound of session.sounds) {
				this.selectedSounds.push(this.sounds.find(x => x.id === sound.id));
			}
			console.log(this.selectedSounds);
			this.createSession = true;
		},

		create: async function () {
			if (!this.start || !this.end || this.selectedSounds.length == 0) return;
			console.log(this.start)
			await axios({
				method: "post",
				url: import.meta.env.VITE_API_URL + "/weekly/new",
				withCredentials: true,
				data: {
					start: ( new Date(this.start).toISOString() ),
					end: ( new Date(this.end).toISOString() ),
					sounds: this.selectedSounds,
				},
			}).then(response => {
				this.getSessions();
				console.log(response.data);
				this.createSession = false;
			});
		},

		del: async function (session) {
			await axios({
				method: "post",
				url: import.meta.env.VITE_API_URL + "/weekly/delete",
				withCredentials: true,
				params: {
					id: session.id,
				},
			}).then(async response => {
				if (response.status == 200) {
					// deleting from local list
					this.sessions.splice(this.sessions.indexOf(session), 1);
				}
			});
		},
	},
};
</script>

<style></style>
