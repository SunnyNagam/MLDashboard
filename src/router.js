import { createWebHashHistory, createRouter } from "vue-router";

import Dashboard from "@/components/Dashboard.vue";
import RedditSummary from "@/components/RedditSummary.vue";
import ScreenBot from "@/components/ScreenBot.vue";
import PhotoGallery from "@/components/PhotoGallery.vue";
import ExpDash from "@/components/ExpDash.vue";
import Landing1 from "@/components/Landing1Test.vue";
import CommunityBoard from "@/components/views/CommunityBoard.vue";
import Landing2 from "@/components/Landing2Test.vue";
import BITPortfolioBeta from "@/components/BITPortfolioBeta.vue";
import TextEditor from "@/components/TextEditor.vue";
import TranscriptSummarizer from "@/components/TranscriptSummarizer.vue";

const routes = [
  { path: "/", name: "home", component: ExpDash },
  { path: "/reddit", name: "reddit", component: RedditSummary },
  { path: "/screen", name: "screen", component: ScreenBot },
  { path: "/photos", name: "photos", component: PhotoGallery },
  { path: "/experimental", name: "experimental", component: Dashboard },
  {
    path: "/landing-beta",
    name: "landing-beta",
    component: Landing1,
  },
  {
    path: "/landing",
    name: "landing",
    component: Landing2,
  },
  {
    path: "/community-board",
    name: "landing-community-board",
    component: CommunityBoard,
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
  {
    path: "/transcript-summarizer",
    name: "transcript-summarizer",
    component: TranscriptSummarizer,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
