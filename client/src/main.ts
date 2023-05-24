/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import App from "./App.vue";

// Composables
import { createApp } from "vue";

// Plugins
import { registerPlugins } from "@/plugins";
const app = createApp(App);

registerPlugins(app);

// Tell Vue to use the plugin
app.mixin({
  methods: {
     handleApiError: function (error: object) {
        // @ts-ignore
        console.log(error.response)
    },
  },
})

app.mount("#app");
