// Composables
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import(/* webpackChunkName: "home" */ '@/views/home.vue'),
      },
        {
        path: '/register',
        name: 'Register',
        component: () => import(/* webpackChunkName: "home" */ '@/views/register.vue'),
      },
      {
        path: '/admin',
        name: 'Admin',
        component: () => import(/* webpackChunkName: "home" */ '@/views/admin.vue'),
      },
      {
        path: '/login',
        name: 'Login',
        component: () => import(/* webpackChunkName: "home" */ '@/views/login.vue'),
      }
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})
import VueCookies from 'vue-cookies';
let unprotected_paths = ["/register", "/login"]
router.beforeEach( (to, from, next) => {
    // @ts-ignore
  if ( !unprotected_paths.includes(to.path) && !VueCookies.get("Ptoken")) {
    return next({ path: "/register" })
  }

  // if user is visiting an unprotected path while logged in return to home
    // @ts-ignore
  if(unprotected_paths.includes(to.path) && VueCookies.get("Ptoken")){
    return next({ path: "/" })
  }

  next()
})

export default router
