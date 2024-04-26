<template>
  <v-app-bar flat scroll-behavior="hide" class="bg-primary">
    <v-app-bar-title
      class="flex justify-start text-no-wrap"
      style="max-width: 20%"
    >
      <v-btn variant="text" @click="goHome" icon="mdi:mdi-home" />
    </v-app-bar-title>

    <template v-slot:append>
      <v-btn variant="text" @click="goReddit" icon="mdi:mdi-reddit" />
    </template>
  </v-app-bar>
</template>

<script setup>
import { useRouter } from "vue-router";
import { computed } from "vue";

const router = useRouter();

const goHome = () => {
  router.push({ name: "home" });
};
const goReddit = () => {
  router.push({ name: "reddit" });
};
</script>
