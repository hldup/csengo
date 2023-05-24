<template>
	<v-alert
		closable
		:title="title"
		:text="message"
		type="info"
		
	/>
</template>

<script>
export default {
	data() {
		return {
			title: "Értesítés",
			message:
				"A alpha tesztelő időszaknak vége, kérem mindenki regisztráljon be újra",
		};
	},
};
</script>

<style></style>
