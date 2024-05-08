import { createMemoryHistory, createRouter } from "vue-router";
import Dashboard from "@/components/Dashboard.vue";
import RedditSummary from "@/components/RedditSummary.vue";
import Goals from "@/components/Goals.vue";

const routes = [
  { path: "/", name: "home", component: Dashboard },
  { path: "/reddit", name: "reddit", component: RedditSummary },
  { path: "/goals", name: "goals", component: Goals },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

export default router;
