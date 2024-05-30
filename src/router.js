import { createWebHashHistory, createRouter } from "vue-router";

import Dashboard from "@/components/Dashboard.vue";
import RedditSummary from "@/components/RedditSummary.vue";
import ScreenBot from "@/components/ScreenBot.vue";
import PhotoGallery from "@/components/PhotoGallery.vue";
import ExpDash from "@/components/ExpDash.vue";
import Landing1 from "@/components/Landing1Test.vue";

const routes = [
  { path: "/", name: "home", component: Dashboard },
  { path: "/reddit", name: "reddit", component: RedditSummary },
  { path: "/screen", name: "screen", component: ScreenBot },
  { path: "/photos", name: "photos", component: PhotoGallery },
  { path: "/experimental", name: "experimental", component: ExpDash },
  { path: "/landing1", name: "landing1", component: Landing1 },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
