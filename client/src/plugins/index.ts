/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import vuetify from "./vuetify";
import router from "../router";

// Types
import type { App } from "vue";
import VueCookies from 'vue-cookies'

export function registerPlugins(app: App) {
	app
	.use(vuetify)
	.use(router)
	.use(VueCookies);
}
