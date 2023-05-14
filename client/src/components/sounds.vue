<template>
	<h1>Hangok</h1>
	<v-table height="40em" fixed-header>
		<thead>
			<tr>
				<th class="text-left">Neve</th>
				<th class="text-left">Feltöltés ideje</th>
				<th class="text-left">Összes szavazat</th>
				<th class="text-left">Opciók</th>
			</tr>
		</thead>

		<tbody>
			<tr v-for="sound in sounds" :key="sound.name">
				<td>{{ sound.name }}</td>
				<td>
					{{
						new Intl.DateTimeFormat("hu-Hu").format(new Date(sound.createdAt))
					}}
				</td>
				<td>{{ sound.votes }}</td>
				<td>
					<v-btn
						@click="
							editSound = sound;
							editDialog = true;
						"
						>Módosítás</v-btn
					>
					
					<v-btn color="error" 
					:disabled="cantdelete.includes(sound.id)"
					@click="del(sound.id)"
					> Törlés</v-btn>
	
				</td>
			</tr>
		</tbody>
	</v-table>

	<v-dialog v-model="editDialog" width="300px">
		<v-card>
			<v-card-text>
				<v-text-field label="Hang neve" v-model="editSound.name"></v-text-field>
			</v-card-text>
			<v-card-actions>
				<v-btn
					color="primary"
					block
					@click="
						editDialog = false;
						edit();
					"
					>Átnevez</v-btn
				>
			</v-card-actions>
			<v-card-actions>
				<v-btn color="error" block @click="editDialog = false">Mégse</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>


  <div class="text-center">
    <v-dialog
      v-model="addSound"
      width="auto"
    >
      <template v-slot:activator="{ props }">
        <v-btn
          color="primary"
          v-bind="props"
		  @click="
		  sound = null;
		  name = ''
		  "
        >
          Létrehozás
        </v-btn>
      </template>

      <v-card style="padding: 2em;">
		<h1>Hang létrehozása</h1>
		<v-sheet width="300" class="mx-auto">
			<v-form @submit.prevent >
				<v-text-field  v-model="name" label="Név" type="text"></v-text-field>
				<v-file-input label="Hang fájl" accept=".mp3" v-model="sound" />
				<v-btn type="submit" block class="mt-2" @click="create"> Létrehozás</v-btn>
			</v-form>
		</v-sheet>
      </v-card>
    </v-dialog>
  </div>

</template>

<script>
import axios from "axios";

export default {
	data() {
		return {
			sounds: [],
			// edit
			dialog: false,
			editDialog: false,
			editSound: null,
			addSound: false,
			// create
			createPrompt: false,

			sound: '',
			name: "",
			cantdelete: [],
		};
	},
	async mounted() {
		await this.getsessions()
		try {
			// getting sounds
			await axios({
				method: "get",
				url: import.meta.env.VITE_API_URL + "/sounds/all",
				withCredentials: true,
			}).then(response => {
				console.log(response);
				this.sounds = response.data;
			});
		} catch (error) {
			console.log(error);
		}
	},
	methods: {
		edit: async function () {
			// getting sounds
			await axios({
				method: "post",
				url: import.meta.env.VITE_API_URL + "/sounds/rename",
				params: { id: this.editSound.id },
				data: {
					name: this.editSound.name,
				},
				withCredentials: true,
			});
		},
		create: async function () {
			let form = new FormData();
			form.append("sound", this.sound[0]), form.append("name", this.name);
			await axios({
				method: "post",
				url: import.meta.env.VITE_API_URL + "/sounds/add",
				data: form,
				withCredentials: true,
			}).then(response => {
				this.addSound = false;
			});
			await this.get()
		},
		get: async function(){
			try {
				// getting sounds
				await axios({
					method: "get",
					url: import.meta.env.VITE_API_URL + "/sounds/all",
					withCredentials: true,
				}).then(response => {
					this.sounds = response.data;
				});
			} catch (error) {
				console.log("failed to get sounds:", error.response || error);
			}
		},
		del: async function(id){
			try {
				// getting sounds
				await axios({
					method: "post",
					url: import.meta.env.VITE_API_URL + "/sounds/delete",
					params: {
						id: id
					},
					withCredentials: true,
				}).then( async response => {
					await this.get();
				});
			} catch (error) {
				console.log(error);
			}
		},
		getsessions: async function () {
			try{

			// getting sounds
			await axios({
				method: "get",
				url: import.meta.env.VITE_API_URL + "/weekly",
				withCredentials: true,
			}).then((response)=>{
				if(!response.data.sounds) return;
				for(let session of response.data){
					for(let sound of session.sounds){
					if(!this.cantdelete.includes(sound.id)){
						this.cantdelete.push(sound.id)
					}
				}
				}
			});
			}catch(error){
				console.log(error)
			}
		},
	},
};
</script>

<style></style>
