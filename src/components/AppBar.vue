<template>
  <v-app-bar flat scroll-behavior="hide" class="bg-primary">
    <v-app-bar-title
      class="flex justify-start text-no-wrap"
      style="max-width: 40%"
    >
      <v-btn variant="text" @click="goHome" icon="mdi:mdi-home" />
      <v-btn variant="text" @click="goReddit" icon="mdi:mdi-reddit" />
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
</script>
