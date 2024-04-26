import { createMemoryHistory, createRouter } from "vue-router";
import Dashboard from "@/components/Dashboard.vue";
import RedditSummary from "@/components/RedditSummary.vue";

const routes = [
  { path: "/", name: "home", component: Dashboard },
  { path: "/reddit", name: "reddit", component: RedditSummary },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

export default router;
