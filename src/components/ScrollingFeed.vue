<template>
  <div class="scrolling-feed-wrapper">
    <div class="scrolling-feed">
      <span
        v-for="(item, index) in feedItems"
        :key="index"
        class="scrolling-item"
      >
        {{ item }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const feedItems = ref([
  "Item 1: Latest Update",
  "Item 2: Breaking News",
  "Item 3: Industry Insights",
  "Item 4: Upcoming Events",
  "Item 5: New Product Launch",
  // Add more items as needed
]);
</script>

<style scoped>
.scrolling-feed-wrapper {
  position: fixed;
  bottom: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  overflow: hidden;
  white-space: nowrap;
}

.scrolling-feed {
  display: inline-block;
  animation: scroll-left 20s linear infinite;
}

.scrolling-item {
  padding: 0 2rem;
}

@keyframes scroll-left {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}
</style>
