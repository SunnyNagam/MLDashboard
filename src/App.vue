<script setup>
import { RouterView, useRoute } from "vue-router";
import AppBar from "@/components/AppBar.vue";
import { computed } from "vue";

const route = useRoute();
const isLanding2TestRoute = computed(
  () => route.name === "landing-simple-test-2"
);
</script>

<template>
  <v-layout>
    <AppBar v-if="!isLanding2TestRoute" />
    <v-main>
      <RouterView />
    </v-main>
  </v-layout>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
