import { createRouter, createWebHistory } from "vue-router";

import Login from "../components/Login.vue";
import Home from "../components/Home.vue";

const routes = [
  {
    path: "/",
    component: Login,
  },
  {
    path: "/home",
    component: Home,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  if (to.path !== "/" && !isLoggedIn) {
    return "/";
  }

  if (to.path === "/" && isLoggedIn) {
    return "/home";
  }

  return true;
});

export default router;
