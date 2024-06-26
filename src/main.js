import { createApp } from "vue";
import "./index.css";
import App from "./App.vue";
// Vuetify
import "vuetify/styles";
import { createVuetify } from "vuetify";
import Vue3TouchEvents from "vue3-touch-events";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
// Icons
import { aliases, mdi } from "vuetify/iconsets/mdi";
import router from "./router";

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: "dark",
  },
});

const app = createApp(App);
app.use(vuetify);
app.use(router);
app.use(Vue3TouchEvents);
app.mount("#app");
