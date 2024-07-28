<template>
  <v-app-bar flat class="bg-grey-darken-4">
    <v-app-bar-title
      class="flex justify-start text-no-wrap"
      style="max-width: 100%"
    >
      <v-btn variant="text" @click="goHome" icon="mdi:mdi-home" />
      <v-btn
        variant="text"
        @click="goExperimental"
        icon="mdi:mdi-chemical-weapon"
      />
      <v-btn variant="text" @click="goReddit" icon="mdi:mdi-reddit" />
      <v-btn
        variant="text"
        @click="goTextEditor"
        icon="mdi:mdi-file-document"
      />
      <v-btn variant="text" @click="goScreen" icon="mdi:mdi-eye" />
      <v-btn variant="text" @click="goPhotos" icon="mdi:mdi-image" />
      <v-btn
        variant="text"
        @click="goLanding1"
        icon="mdi:mdi-airplane-landing"
      />
      <v-btn
        variant="text"
        @click="goBITPortfolioBeta"
        icon="mdi:mdi-briefcase"
      />
    </v-app-bar-title>

    <template v-slot:append> </template>
  </v-app-bar>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const goHome = () => {
  router.push({ name: "home" });
};
const goReddit = () => {
  router.push({ name: "reddit" });
};
const goScreen = () => {
  router.push({ name: "screen" });
};
const goPhotos = () => {
  router.push({ name: "photos" });
};
const goExperimental = () => {
  router.push({ name: "experimental" });
};
const goLanding1 = () => {
  router.push({ name: "landing-simple-test" });
};
const goBITPortfolioBeta = () => {
  router.push({ name: "bit-portfolio-beta" });
};
const goTextEditor = () => {
  router.push({ name: "text-editor" });
};
</script>
