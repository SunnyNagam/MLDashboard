import { createWebHashHistory, createRouter } from "vue-router";

import Dashboard from "@/components/Dashboard.vue";
import RedditSummary from "@/components/RedditSummary.vue";
import ScreenBot from "@/components/ScreenBot.vue";
import PhotoGallery from "@/components/PhotoGallery.vue";
import ExpDash from "@/components/ExpDash.vue";
import Landing1 from "@/components/Landing1Test.vue";
import BITPortfolioBeta from "@/components/BITPortfolioBeta.vue";
import TextEditor from "@/components/TextEditor.vue";

const routes = [
  { path: "/", name: "home", component: Dashboard },
  { path: "/reddit", name: "reddit", component: RedditSummary },
  { path: "/screen", name: "screen", component: ScreenBot },
  { path: "/photos", name: "photos", component: PhotoGallery },
  { path: "/experimental", name: "experimental", component: ExpDash },
  {
    path: "/landing-simple-test",
    name: "landing-simple-test",
    component: Landing1,
  },
  {
    path: "/bit-portfolio-beta",
    name: "bit-portfolio-beta",
    component: BITPortfolioBeta,
  },
  {
    path: "/text-editor",
    name: "text-editor",
    component: TextEditor,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
