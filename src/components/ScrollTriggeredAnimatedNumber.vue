<template>
  <div ref="numberContainer">
    <animated-number
      :value="value"
      :duration="duration"
      :start-animation="isVisible"
    />{{ symbol }}
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from "vue";
import AnimatedNumber from "@/components/AnimatedNumber.vue";

const props = defineProps({
  value: {
    type: Number,
    required: true,
  },
  symbol: {
    type: String,
    default: "",
  },
  duration: {
    type: Number,
    default: 3000,
  },
});

const numberContainer = ref(null);
const isVisible = ref(false);

watchEffect(() => {
  if (numberContainer.value) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          isVisible.value = true;
          console.log("Scrolled into view detected, starting number animation");
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(numberContainer.value);
  }
});
</script>
