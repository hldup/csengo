import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
const app = createApp(App)
import VueCookies from 'vue-cookies'

app.use(VueCookies);

app.use(router)
app.mount('#app')
