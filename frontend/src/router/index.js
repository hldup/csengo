import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RegisterView from  '../views/RegisterView.vue'
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/register',
    name: 'Regisztráció',
    component: RegisterView
  },
   {
    path: '/login',
    name: 'Belépés',
    component: () => import(/* webpackChunkName: "about" */ '../views/LoginView.vue')
  },
  {
    path: '/admin',
    name: 'Admin Panel - Pollak csengo',
    component: () => import('../views/AdminView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})
import VueCookies from 'vue-cookies';
let unprotected_paths = ["/register", "/login"]

router.beforeEach( (to, from, next) => {
  if ( !unprotected_paths.includes(to.path) && !VueCookies.get("Ptoken")) {
    return next({ path: "/register" })
  }

  // if user is visiting an unprotected path while logged in return to home
  if(unprotected_paths.includes(to.path) && VueCookies.get("Ptoken")){
    return next({ path: "/" })
  }

  next()
})

export default router
