<template>
	<v-alert
		closable
		:title="title"
		:text="message"
		type="info"
		style="
    position: absolute;
    left: 50%;
    top: 6em
    z-index: 1;
    "
	/>
</template>

<script>
export default {
	data() {
		return {
			title: "Értesítés",
			message:
				"A bétatesztelő időszaknak vége, kérem mindenki regisztráljon be újra",
		};
	},
};
</script>

<style></style>
