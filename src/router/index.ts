import { createRouter, createWebHashHistory } from "vue-router"
import ImportPage from "@/pages/ImportPage.vue"
import SimulationPage from "@/pages/SimulationPage.vue"

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", redirect: "/simulation" },
    { path: "/simulation", component: SimulationPage },
    { path: "/import", component: ImportPage },
  ],
})
