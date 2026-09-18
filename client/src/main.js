import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)

app.use(createPinia()) // must come before router if any route guard reads a store - not the case yet, but good habit

app.use(router)
app.mount('#app')