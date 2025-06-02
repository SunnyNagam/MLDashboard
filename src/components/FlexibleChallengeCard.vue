<template>
  <v-card :class="['mx-auto', isExpanded ? 'h-full d-flex flex-column' : '']" elevation="2" rounded="lg">
    <!-- Toolbar -->
    <v-toolbar color="grey-darken-4" dark density="compact" :elevation="8" border="bottom">
      <v-btn
        icon
        @click="
          showContent = !showContent;
          props.collapsed = !showContent;
        "
      >
        <v-icon>{{ showContent ? "mdi-chevron-up" : "mdi-chevron-down" }}</v-icon>
      </v-btn>

      <v-toolbar-title>Habits</v-toolbar-title>

      <!-- Display Total Habit Score -->
      <v-chip color="amber" class="ml-2">
        <v-icon start>mdi-trophy</v-icon>
        {{ totalCompletionsScore }}
      </v-chip>

      <v-btn icon="mdi-arrow-expand" @click="$emit('expand')" />

      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon="mdi-sort" v-bind="props"></v-btn>
        </template>
        <v-list>
          <v-list-item @click="sortTasks('favorites')">
            <v-list-item-title>Sort by Favorites</v-list-item-title>
          </v-list-item>
          <v-list-item @click="sortTasks('duration')">
            <v-list-item-title>Sort by Duration</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon="mdi-dots-vertical" v-bind="props"></v-btn>
        </template>
        <v-list>
          <v-list-item @click="cleanupTrackingData">
            <v-list-item-title>Reset Tracking Data</v-list-item-title>
          </v-list-item>
          <v-list-item @click="resetToDefaults">
            <v-list-item-title>Reset to Defaults</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-toolbar>

    <div v-if="showContent" :class="['d-flex flex-column', isExpanded ? 'flex-grow-1' : '']">
      <!-- Today's Activities Section -->
      <v-card-text class="pt-2 pb-0 px-2">
        <v-card class="today-card" color="grey-darken-4">
          <v-card-title class="d-flex align-center">
            <v-icon color="amber-lighten-1" class="mr-2">mdi-calendar-today</v-icon>
            <span
              >Today's Plan <span class="text-caption">{{ currentDate }}</span></span
            >
            <v-spacer></v-spacer>
            <div class="d-flex align-center">
              <v-chip size="small" color="amber">{{ totalTodayDuration }}</v-chip>
            </div>
          </v-card-title>

          <v-divider></v-divider>

          <v-card-text class="min-h-[60px] p-2">
            <draggable
              v-model="todayHabits"
              :group="{ name: 'habits', pull: true, put: true }"
              item-key="id"
              class="flex flex-wrap min-h-[60px]"
              ghost-class="ghost-task"
              drag-class="dragging-task"
              :animation="200"
              @change="handleTodayChange"
            >
              <template #item="{ element }">
                <v-chip
                  :color="element.color || 'primary'"
                  variant="elevated"
                  class="ma-1 today-chip"
                  closable
                  @click:close="removeFromToday(element)"
                  @click="showHabitDetails(element)"
                >
                  <v-icon start size="small">mdi-checkbox-blank-circle-outline</v-icon>
                  {{ element.title }}
                  <span v-if="element.duration" class="text-xs ms-2 text-grey-100">({{ element.duration }})</span>
                </v-chip>
              </template>
              <template #header>
                <div v-if="todayHabits.length === 0" class="text-center py-4 empty-today">
                  <v-icon size="large" color="grey-darken-1">mdi-drag</v-icon>
                  <div class="text-grey-darken-1 mt-2">Drag habits here to plan your day</div>
                </div>
              </template>
            </draggable>
          </v-card-text>
        </v-card>
      </v-card-text>

      <!-- Habits Section -->
      <v-card-text>
        <v-card class="category-column d-flex flex-column">
          <v-card-title class="d-flex align-center gap-2 py-2">
            <v-icon>mdi-lightning-bolt</v-icon>
            <span>Habits</span>
            <v-spacer></v-spacer>
            <div class="bg-[rgba(255,9,9,0.1)] rounded-md h-full text-center">
              <draggable v-model="trashZone" :group="{ name: 'habits', put: true, pull: false }" item-key="id" ghost-class="ghost-task" :animation="200">
                <template #header>
                  <v-icon color="rgba(255, 9, 9, 0.2)" size="large" class="">mdi-delete-circle</v-icon>
                </template>
                <template #item="{ element }"> </template>
              </draggable>
            </div>
          </v-card-title>

          <v-divider></v-divider>

          <!-- Energy Level Sections -->
          <v-card-text class="flex-grow pa-0 overflow-y-auto max-h-full">
            <div v-for="category in categories" :key="category.level" class="rounded overflow-hidden border border-white border-opacity-10">
              <div class="d-flex align-center w-100 px-3 min-h-[40px] font-medium">
                <span class="mr-2">{{ category.icon }}</span>
                <span class="font-weight-medium">{{ category.level }}</span>
                <v-spacer></v-spacer>
                <v-btn
                  icon="mdi-plus"
                  size="x-small"
                  @click.stop="
                    () => {
                      openHabitDialog('habit');
                      currentItem.energyLevel = categories.find((c) => c.level === category.level).level;
                    }
                  "
                ></v-btn>
              </div>

              <div class="pr-2">
                <draggable
                  v-model="filteredHabits[category.level]"
                  :group="{ name: 'habits', pull: true, put: true }"
                  item-key="id"
                  class="min-h-[50px] p-1"
                  @change="handleDragChange"
                  :animation="200"
                  ghost-class="ghost-task"
                  drag-class="dragging-task"
                >
                  <template #item="{ element }">
                    <v-chip :color="element.color || undefined" class="ma-1 justify-start cursor-grab relative" @click="showHabitDetails(element)">
                      <template v-slot:prepend>
                        <v-icon
                          size="small"
                          :icon="element.favorite ? 'mdi-star' : 'mdi-star-outline'"
                          @click.stop="
                            element.favorite = !element.favorite;
                            saveState();
                          "
                          :color="element.favorite ? 'amber' : ''"
                          class="pr-2"
                        ></v-icon>
                      </template>
                      {{ element.title }}
                      <!-- Duration as a chip -->
                      <v-chip size="x-small" color="grey" class="ml-1">{{ element.duration }}</v-chip>

                      <!-- Show streak if exists -->
                      <v-chip v-if="element.currentStreak > 0" size="x-small" color="amber" class="ml-1" :text="`${element.currentStreak}🔥`"></v-chip>

                      <!-- Show total completions instead of complete button -->
                      <v-chip size="x-small" color="success" class="ml-1">{{ element.totalCompletions || 0 }}</v-chip>
                    </v-chip>
                  </template>
                </draggable>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-card-text>
    </div>

    <v-dialog v-model="itemDialog" max-width="500">
      <v-card>
        <v-card-title> {{ currentItem.id ? "Edit" : "Add New" }} Habit </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="saveHabit">
            <v-text-field v-model="currentItem.title" label="Title" required></v-text-field>
            <v-textarea v-model="currentItem.description" label="Description" rows="3"></v-textarea>
            <v-text-field v-model="currentItem.duration" label="Duration (e.g. '15 mins')"></v-text-field>
            <v-select v-model="currentItem.color" :items="colorOptions" label="Color" clearable></v-select>
            <v-select v-model="currentItem.energyLevel" :items="categories" item-title="level" item-value="level" label="Energy Level"></v-select>
          </v-form>
        </v-card-text>

        <!-- Add tracking section for habits -->
        <v-divider class="my-3"></v-divider>

        <v-card-text>
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-subtitle-1">Progress Tracking</span>

            <!-- Remove the complete button and add instruction text -->
            <v-chip color="info" size="small">
              <v-icon start size="small">mdi-information-outline</v-icon>
              Drag to Today's Plan to complete
            </v-chip>
          </div>

          <div class="d-flex align-center mb-2">
            <v-icon color="amber" class="mr-2">mdi-trophy</v-icon>
            <span>Total completions: {{ currentItem.totalCompletions || 0 }}</span>
          </div>

          <div class="d-flex align-center mb-2">
            <v-icon color="orange" class="mr-2">mdi-fire</v-icon>
            <span>Current streak: {{ currentItem.currentStreak || 0 }} days</span>
          </div>

          <div class="mt-4">
            <div class="text-subtitle-2 mb-1">Last 30 days:</div>
            <div class="d-flex justify-space-between flex-wrap">
              <span
                v-for="i in 30"
                :key="i"
                :class="{ 'text-success': (currentItem.completionBitMap & (1 << (i - 1))) !== 0 }"
                class="mx-px text-lg leading-none"
              >
                {{ (currentItem.completionBitMap & (1 << (i - 1))) !== 0 ? "●" : "○" }}
              </span>
            </div>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-btn
            v-if="currentItem.id"
            color="error"
            @click="
              deleteHabit(currentItem);
              itemDialog = false;
            "
          >
            Delete
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" @click="itemDialog = false">Cancel</v-btn>
          <v-btn color="success" @click="saveHabit" :disabled="!currentItem.title"> {{ currentItem.id ? "Save" : "Add" }} Habit </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import draggable from "vuedraggable";
import { useApi } from "@/useAPI.js";

const { getApiKey } = useApi();

// Props
const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
  isExpanded: {
    type: Boolean,
    default: false,
  },
});

// Emits
defineEmits(["expand"]);

// State
const showContent = ref(!props.collapsed);
const apiIsLoading = ref(false);
const itemDialog = ref(false);
const trashZone = ref([]);

// Habit form
const currentItem = ref({
  id: null,
  title: "",
  description: "",
  color: "",
  duration: "",
  energyLevel: null,
  level: null,
  favorite: false,
  totalCompletions: 0,
  currentStreak: 0,
  completionBitMap: 0,
  lastUpdated: new Date().toISOString().split("T")[0],
});

// Constants
const BASE_URL = "https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod";
const THIRTY_DAY_MASK = 0x3fffffff; // 30 bits of 1s

// Energy level categories
const categories = [
  { level: "Low Options", icon: "🌧️", color: "blue-grey", bgColor: "blue-grey-darken-4" },
  { level: "Medium Options", icon: "🌤️", color: "amber", bgColor: "amber-darken-4" },
  { level: "High Options", icon: "🌞", color: "success", bgColor: "success-darken-4" },
];

// Color options for habits
const colorOptions = ["primary", "secondary", "success", "info", "warning", "error", "blue", "green", "purple", "teal", "cyan"];

// Helper function to create new habits
const createNewHabit = (title, description, duration, level) => ({
  id: `habit-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
  title,
  description,
  duration,
  level,
  totalCompletions: 0,
  currentStreak: 0,
  completionBitMap: 0,
  lastUpdated: new Date().toISOString().split("T")[0],
});

// Default habits database
const defaultHabits = {
  "Low Options": [
    createNewHabit("5-min walk", "A quick walk around the block to get some fresh air", "5 mins", "Low Options"),
    createNewHabit("Quick shower/self-care", "Basic self-care routine", "10 mins", "Low Options"),
    createNewHabit("Short journaling", "Write down current thoughts and feelings", "5 mins", "Low Options"),
    createNewHabit("5-min meditation", "Brief mindfulness practice", "5 mins", "Low Options"),
  ],
  "Medium Options": [
    createNewHabit("15-min home workout", "Quick home fitness routine", "15 mins", "Medium Options"),
    createNewHabit("20-30 min coding", "Short coding practice session", "25 mins", "Medium Options"),
    createNewHabit("Quick social interaction", "Brief chat or call with friend/family", "15 mins", "Medium Options"),
    createNewHabit("Cook easy meal", "Prepare a simple, healthy meal", "30 mins", "Medium Options"),
  ],
  "High Options": [
    createNewHabit("Full gym session", "Complete workout at the gym", "60 mins", "High Options"),
    createNewHabit("Exciting coding project", "Work on a challenging coding project", "60+ mins", "High Options"),
    createNewHabit("Social event", "Attend or plan a social gathering", "Flexible", "High Options"),
    createNewHabit("New experience", "Try something new and stimulating", "Flexible", "High Options"),
  ],
};

// Reactive habit lists
const habits = ref({
  "Low Options": [...defaultHabits["Low Options"]],
  "Medium Options": [...defaultHabits["Medium Options"]],
  "High Options": [...defaultHabits["High Options"]],
});

// Today's planned habits
const todayHabits = ref([]);

// Computed properties
const currentDate = computed(() =>
  new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
);

const totalTodayDuration = computed(() => {
  if (todayHabits.value.length === 0) return "0 mins";

  const totalMinutes = todayHabits.value.reduce((total, habit) => {
    const match = habit.duration?.match(/\d+/);
    return total + (match ? parseInt(match[0]) : 0);
  }, 0);

  return `${totalMinutes} mins`;
});

const totalCompletionsScore = computed(() =>
  Object.values(habits.value)
    .flat()
    .reduce((total, habit) => total + (habit.totalCompletions || 0), 0)
);

const filteredHabits = computed(() => habits.value);

// Utility functions
const getTodaysDate = () => new Date().toISOString().split("T")[0];

const parseDuration = (duration) => {
  if (!duration || duration === "Flexible") return Infinity;
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : Infinity;
};

// API functions
const apiCall = async (endpoint, method = "GET", body = null) => {
  apiIsLoading.value = true;
  try {
    const response = await fetch(endpoint, {
      method,
      headers: { "X-Api-Key": getApiKey() },
      body: body ? JSON.stringify(body) : null,
    });
    return await response.json();
  } finally {
    apiIsLoading.value = false;
  }
};

const saveState = async () => {
  const stateToSave = {
    categoryTasks: habits.value, // Keep old key name for compatibility
    todayActivities: todayHabits.value, // Keep old key name for compatibility
    lastSaved: new Date().toISOString(),
  };

  localStorage.setItem("habitsHub", JSON.stringify(stateToSave));

  if (getApiKey()) {
    apiCall(`${BASE_URL}/getData?key=HabitsHub`, "PUT", stateToSave);
  }
};

const loadSavedState = async () => {
  try {
    if (getApiKey()) {
      // Try new endpoint first, fallback to old endpoint
      let habitData = await apiCall(`${BASE_URL}/getData?key=HabitsHub`);

      if (!habitData?.categoryTasks) {
        console.log("Migrating from old endpoint...");
        habitData = await apiCall(`${BASE_URL}/getData?key=HabitAndTodoHub`);

        if (habitData?.categoryTasks) {
          const migratedData = {
            categoryTasks: habitData.categoryTasks,
            todayActivities: habitData.todayActivities?.filter((item) => !item.isTodo) || [],
            lastSaved: new Date().toISOString(),
          };
          apiCall(`${BASE_URL}/getData?key=HabitsHub`, "PUT", migratedData);
          habitData = migratedData;
        }
      }

      if (habitData?.categoryTasks) {
        habits.value = habitData.categoryTasks;
        todayHabits.value = habitData.todayActivities?.filter((item) => !item.isTodo) || [];
      }
      return;
    }

    // localStorage fallback with migration
    let savedState = localStorage.getItem("habitsHub");

    if (!savedState) {
      console.log("Migrating from old localStorage...");
      savedState = localStorage.getItem("habitAndTodoHub");

      if (savedState) {
        const oldData = JSON.parse(savedState);
        const migratedData = {
          categoryTasks: oldData.categoryTasks,
          todayActivities: oldData.todayActivities?.filter((item) => !item.isTodo) || [],
          lastSaved: new Date().toISOString(),
        };
        localStorage.setItem("habitsHub", JSON.stringify(migratedData));
        savedState = JSON.stringify(migratedData);
      }
    }

    if (savedState) {
      const data = JSON.parse(savedState);
      habits.value = data.categoryTasks;
      todayHabits.value = data.todayActivities?.filter((item) => !item.isTodo) || [];
    }

    updateHabitTracking();
  } catch (error) {
    console.error("Error loading saved state:", error);
  }
};

// Habit management functions
const removeFromToday = (habit) => {
  const index = todayHabits.value.findIndex((h) => h.id === habit.id);
  if (index !== -1) {
    const removedHabit = todayHabits.value[index];
    habits.value[removedHabit.level].push(removedHabit);
    todayHabits.value.splice(index, 1);
  }
};

const showHabitDetails = (habit) => openHabitDialog(habit);

const sortHabits = (criterion) => {
  const sortBy = (a, b) => {
    if (criterion === "favorites") {
      if (a.favorite && !b.favorite) return -1;
      if (!a.favorite && b.favorite) return 1;
    } else if (criterion === "duration") {
      return parseDuration(a.duration) - parseDuration(b.duration);
    }
    return a.title.localeCompare(b.title);
  };

  Object.keys(habits.value).forEach((category) => {
    habits.value[category].sort(sortBy);
  });
  saveState();
};

const openHabitDialog = (habit = null) => {
  currentItem.value = {
    id: null,
    title: "",
    description: "",
    color: "",
    duration: "15 mins",
    energyLevel: null,
    level: null,
    favorite: false,
    completionBitMap: 0,
    currentStreak: 0,
    totalCompletions: 0,
    lastUpdated: getTodaysDate(),
  };

  if (habit) {
    Object.assign(currentItem.value, habit);
  }

  itemDialog.value = true;
};

const saveHabit = () => {
  const habit = { ...currentItem.value };

  if (!habit.id) {
    habit.id = `habit-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }

  habit.level = habit.energyLevel;
  habit.duration = habit.duration || "Flexible";

  // Remove from old category if editing
  if (habit.id) {
    Object.values(habits.value).forEach((categoryHabits) => {
      const index = categoryHabits.findIndex((h) => h.id === habit.id);
      if (index !== -1) categoryHabits.splice(index, 1);
    });
  }

  habits.value[habit.level].push(habit);
  itemDialog.value = false;
  saveState();
};

const deleteHabit = (habit) => {
  Object.values(habits.value).forEach((categoryHabits) => {
    const index = categoryHabits.findIndex((h) => h.id === habit.id);
    if (index !== -1) categoryHabits.splice(index, 1);
  });

  removeFromToday(habit);
  saveState();
};

const resetToDefaults = () => {
  if (confirm("This will reset all your habits to defaults. Continue?")) {
    habits.value = {
      "Low Options": [...defaultHabits["Low Options"]],
      "Medium Options": [...defaultHabits["Medium Options"]],
      "High Options": [...defaultHabits["High Options"]],
    };
    todayHabits.value = [];
    saveState();
  }
};

const cleanupTrackingData = () => {
  if (confirm("This will reset all completion counts and streaks but keep your habits. Continue?")) {
    const today = getTodaysDate();

    Object.values(habits.value)
      .flat()
      .forEach((habit) => {
        habit.completionBitMap = 0;
        habit.totalCompletions = 0;
        habit.currentStreak = 0;
        habit.lastUpdated = today;
      });

    todayHabits.value = [];
    saveState();
  }
};

// Drag and drop handlers
const handleDragChange = (evt) => {
  if (evt.added) {
    const habit = evt.added.element;
    habit.level = findHabitCategory(habit);
  }
  saveState();
};

const handleTodayChange = (evt) => {
  if (evt.added) {
    const habit = evt.added.element;
    completeHabit(habit);
    console.log(`Habit "${habit.title}" completed!`);
  }
  saveState();
};

// Watch for items being dragged to trash instead of using @change
watch(
  trashZone,
  (newItems, oldItems) => {
    if (newItems.length > oldItems.length) {
      // An item was added to trash
      const newItem = newItems[newItems.length - 1];

      if (confirm(`Delete "${newItem.title}"?`)) {
        deleteHabit(newItem);
      } else {
        // If user cancels, put the habit back to its original category
        const category = newItem.level || "Low Options";
        if (habits.value[category]) {
          habits.value[category].push(newItem);
        } else {
          habits.value["Low Options"].push(newItem);
        }
        saveState();
      }

      // Clear the trash zone
      trashZone.value = [];
    }
  },
  { deep: true }
);

// Utility functions
const findHabitCategory = (habit) => {
  for (const [category, categoryHabits] of Object.entries(habits.value)) {
    if (categoryHabits.some((h) => h.id === habit.id)) return category;
  }
};

// Habit tracking functions
const completeHabit = (habit) => {
  const today = getTodaysDate();
  const daysSinceUpdate = Math.floor((new Date(today) - new Date(habit.lastUpdated || today)) / (1000 * 60 * 60 * 24));

  if (daysSinceUpdate > 0) {
    habit.completionBitMap = (habit.completionBitMap << daysSinceUpdate) & THIRTY_DAY_MASK;
  }

  habit.completionBitMap |= 1; // Set today's bit
  habit.totalCompletions = (habit.totalCompletions || 0) + 1;

  // Calculate streak
  if (daysSinceUpdate === 0) {
    if (habit.currentStreak === 0) habit.currentStreak = 1;
  } else if (daysSinceUpdate === 1) {
    const yesterdayCompleted = (habit.completionBitMap & 2) !== 0;
    habit.currentStreak = yesterdayCompleted ? (habit.currentStreak || 0) + 1 : 1;
  } else {
    habit.currentStreak = 1;
  }

  habit.lastUpdated = today;
  saveState();
};

const updateHabitTracking = () => {
  const today = getTodaysDate();

  Object.values(habits.value)
    .flat()
    .forEach((habit) => {
      if (habit.completionBitMap === undefined) {
        habit.completionBitMap = 0;
        habit.totalCompletions = habit.totalCompletions || 0;
        habit.currentStreak = 0;
        habit.lastUpdated = today;
      } else if (habit.lastUpdated !== today) {
        const daysSinceUpdate = Math.floor((new Date(today) - new Date(habit.lastUpdated || today)) / (1000 * 60 * 60 * 24));

        if (daysSinceUpdate > 0) {
          habit.completionBitMap = (habit.completionBitMap << daysSinceUpdate) & THIRTY_DAY_MASK;
          habit.currentStreak = 0; // Reset streak if any days passed
          habit.lastUpdated = today;
        }
      }

      // Ensure streak is 0 if not completed today
      const todayCompleted = (habit.completionBitMap & 1) !== 0;
      if (!todayCompleted) habit.currentStreak = 0;
    });

  saveState();
};

// Watchers and lifecycle
watch([habits, todayHabits], saveState, { deep: true });
watch(
  () => props.collapsed,
  (newValue) => {
    showContent.value = !newValue;
  }
);

onMounted(loadSavedState);
</script>

<style scoped>
.category-column {
  min-height: 300px;
  max-height: 500px;
  display: flex;
  flex-direction: column;
}

.today-card {
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.today-chip {
  margin: 4px !important;
  flex-grow: 0;
}

.empty-today {
  width: 100%;
  opacity: 0.8;
}

@media (max-width: 960px) {
  .category-column {
    min-height: 200px;
    max-height: 300px;
  }

  .v-card-title {
    font-size: 1rem;
  }
}

.ghost-task {
  opacity: 0.5;
  background: rgba(255, 255, 255, 0.1);
  border: 1px dashed white;
}

.dragging-task {
  cursor: grabbing;
}

/* Fix Safari scrolling issues if any */
.overflow-y-auto {
  -webkit-overflow-scrolling: touch;
}

/* Trash zone styling */
.trash-zone {
  border-radius: 8px;
  transition: all 0.2s ease;
}

.trash-zone:hover {
  background-color: rgba(244, 67, 54, 0.1);
}
</style>
