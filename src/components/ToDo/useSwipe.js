// useSwipe.js
import { ref } from "vue";

export function useSwipe() {
  const swipeState = ref({});
  const swipeStartX = ref({});
  const swipeProgress = ref({});

  const startSwipe = (itemId, clientX) => {
    swipeStartX.value[itemId] = clientX;
    swipeState.value[itemId] = null;
    swipeProgress.value[itemId] = 0;
  };

  const updateSwipe = (itemId, clientX) => {
    const diff = clientX - (swipeStartX.value[itemId] || 0);
    const screenWidth = window.innerWidth;
    const maxSwipeDistance = screenWidth * 0.3;
    swipeProgress.value[itemId] = Math.min(
      Math.abs(diff) / maxSwipeDistance,
      1
    );

    if (Math.abs(diff) > screenWidth * 0.05) {
      swipeState.value[itemId] = diff < 0 ? "left" : "right";
    } else {
      swipeState.value[itemId] = "none";
    }
  };

  const endSwipe = (itemId) => {
    delete swipeState.value[itemId];
    delete swipeStartX.value[itemId];
    delete swipeProgress.value[itemId];
  };

  const getSwipeStyle = (itemId) => {
    const progress = swipeProgress.value[itemId] || 0;
    const state = swipeState.value[itemId];

    if (state === "left") {
      return {
        background: `radial-gradient(circle at right, rgba(236, 203, 58, ${
          progress * 0.7
        }), transparent)`,
      };
    } else if (state === "right") {
      return {
        background: `radial-gradient(circle at left, rgba(255, 0, 0, ${
          progress * 0.7
        }), transparent)`,
      };
    }
    return {};
  };

  return {
    swipeState,
    swipeStartX,
    swipeProgress,
    startSwipe,
    updateSwipe,
    endSwipe,
    getSwipeStyle,
  };
}
