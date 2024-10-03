<template>
  <div class="scrolling-feed-wrapper bg-gray-800 text-white py-4">
    <div class="scrolling-feed">
      <span
        v-for="(item, index) in feedItems"
        :key="index"
        class="scrolling-item px-6 flex-shrink-0"
      >
        <v-card
          class="bg-transparent shadow-none d-flex align-center elevation-0"
        >
          <v-img
            :src="item.thumbnail"
            :alt="item.title"
            class="mr-4 rounded"
            width="50"
            height="50"
          ></v-img>
          <v-card-text>
            <h3 class="text-xl font-semibold">{{ item.title }}</h3>
            <p class="text-sm">{{ item.description }}</p>
          </v-card-text>
        </v-card>
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// Example feed items with thumbnails
const feedItems = ref([
  {
    title: "New Equipment Launch",
    description:
      "Introducing our latest range of oil and gas equipment designed for maximum efficiency.",
    thumbnail:
      "https://w7.pngwing.com/pngs/508/107/png-transparent-olive-oil-olive-pomace-oil-olive-oil-food-olive-oil-thumbnail.png",
  },
  {
    title: "Sustainability Initiative",
    description:
      "Learn more about our commitment to reducing carbon emissions and promoting eco-friendly practices.",
    thumbnail: "/path/to/sustainability-thumbnail.jpg",
  },
  {
    title: "Customer Success Story",
    description:
      "Discover how ASSK Inc. helped OilCo streamline their operations with our top-notch equipment.",
    thumbnail:
      "https://www.omnycontent.com/d/playlist/d841b3ef-1a6a-466b-af0e-a93b0120ba34/0ba014ef-6a3b-425f-beea-ac8b00e2df57/a0125dda-e4a5-428e-be8d-ac8b00e2df6a/image.jpg?t=1615394450&size=small",
  },
  {
    title: "Upcoming Industry Conference",
    description:
      "Join us at the Annual Oil & Gas Conference to network and learn about the latest industry trends.",
  },
  {
    title: "Special Offer: 10% Discount",
    description:
      "For a limited time, enjoy a 10% discount on all equipment purchases. Contact us for more details!",
  },
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
  display: flex;
  animation: scroll-left 30s linear infinite;
}

.scrolling-item {
  min-width: 400px;
}

@keyframes scroll-left {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}

/* Pause animation on hover */
.scrolling-feed-wrapper:hover .scrolling-feed {
  animation-play-state: paused;
}
</style>
