<template>
  <span>{{ displayNumber }}</span>
</template>

<script>
import { ref, watch } from "vue";

export default {
  props: {
    value: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      default: 2000,
    },
    startAnimation: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const displayNumber = ref(0);

    const animateValue = (start, end, duration) => {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        displayNumber.value = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    };

    watch(
      () => props.startAnimation,
      (newValue) => {
        if (newValue) {
          animateValue(0, props.value, props.duration);
        }
      }
    );

    watch(
      () => props.value,
      (newValue, oldValue) => {
        if (props.startAnimation) {
          animateValue(oldValue, newValue, props.duration);
        }
      }
    );

    return {
      displayNumber,
    };
  },
};
</script>
