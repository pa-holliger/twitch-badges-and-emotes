import { createApp } from "vue"
import { createPinia } from "pinia"
import "./style.css"
import { useTheme } from "./composables/useTheme"
import App from "./App.vue"
import router from "./router"

useTheme()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount("#app")
