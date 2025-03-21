import { createApp } from "vue";
import "./style.css";
import { createPinia } from "pinia";
import App from "./App.vue";

import "primeicons/primeicons.css";

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.mount("#app");
