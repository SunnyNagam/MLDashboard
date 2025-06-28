<script setup>
// SECTION: Imports
import { ref, computed, shallowRef, markRaw, onMounted, watch, onUnmounted } from "vue";
import draggable from "vuedraggable";
import { useDisplay, useTheme } from "vuetify";

// Composables
import { useApi } from "@/useAPI.js";
import { useNotesStore } from "@/stores/useNotesStore";

// Component Imports
import Calendar from "@/components/Calendar.vue";
import Tasks from "@/components/Tasks.vue";
import Chat from "@/components/Chat.vue";
import FlexibleChallengeCard from "@/components/FlexibleChallengeCard.vue";
import RedditSummaryCard from "@/components/RedditSummaryCard.vue";
import TodoAITreeDisp from "@/components/TodoAITreeDisp.vue";
import TodoListCard from "@/components/ToDo/TodoListCard.vue";
import TreeNotes from "@/components/TreeNotes.vue";
import TodoList from "@/components/TodoList.vue";
import Woosh from "./Woosh.vue";
import WooshFriendsTest from "@/components/WooshFriendsTest.vue";
import TranscriptSummarizer from "@/components/TranscriptSummarizer.vue";
import WebView from "@/components/WebView.vue";

// SECTION: API Key Management
const apiKeyModalVisible = ref(false);
const enteredApiKey = ref("");
const { getApiKey, setApiKey } = useApi();

// Check if API key is present on component mount, if not, show modal
if (getApiKey() === null || getApiKey() === "") {
  apiKeyModalVisible.value = true;
}

function handleApiKeySubmit(apiKey) {
  setApiKey(apiKey);
  apiKeyModalVisible.value = false;
  window.location.reload();
}

// SECTION: Theme and Context Configuration
const theme = useTheme();
theme.global.name.value = "dark"; // Set default theme to dark

const otherContext = `The User is named Sunny, and the current date is ${new Date().toDateString()}.`;

// SECTION: Component Expansion Logic
const expandedComponent = ref(null);
const expandedProps = ref({});
const isExpanded = ref(false);

/**
 * Expands a given component in a dialog.
 *
 * @param {Component} component - The component to expand.
 * @param {object} [props={}] - Optional props to pass to the expanded component.
 */
function expandComponent(component, props = {}) {
  expandedComponent.value = markRaw(component);
  expandedProps.value = { ...props, isExpanded: true };
  isExpanded.value = true;
}

// SECTION: Layout Management (Loading, Saving, Default Configuration)
const list1 = shallowRef([]); // Left column components
const list2 = shallowRef([]); // Right column components
const isLayoutLoaded = ref(false);
const apiIsLoading = ref(false);

const defaultConfig = {
  list1: [
    {
      name: "Flexible Challenge System",
      component: FlexibleChallengeCard,
      props: { collapsed: false },
      on: { expand: (event) => expandComponent(FlexibleChallengeCard, { collapsed: false }) },
    },
    {
      name: "Todo List",
      component: TodoListCard,
      props: { collapsed: false },
      on: { expand: (event) => expandComponent(TodoListCard, { title: "Now" }) },
    },
    { name: "Tree Notes", component: TreeNotes, on: { expand: () => expandComponent(TreeNotes) } },
    {
      name: "Todo List",
      component: TodoListCard,
      props: {
        title: "Soon",
        collapsed: true,
      },
      on: {
        expand: (event) => expandComponent(TodoListCard, { title: "Soon" }),
      },
    },
    {
      name: "Woosh",
      component: Woosh,
    },
  ],
  list2: [
    {
      name: "Calendar",
      component: Calendar,
      props: { collapsed: false },
      on: { expand: () => expandComponent(Calendar, { collapsed: false }) },
    },
    {
      name: "Tasks",
      component: Tasks,
      props: { collapsed: false },
      on: { expand: () => expandComponent(Tasks, { collapsed: false }) },
    },
    {
      name: "Reddit Summary",
      component: RedditSummaryCard,
      props: { collapsed: false },
      on: { expand: () => expandComponent(RedditSummaryCard, { collapsed: false }) },
    },
    {
      name: "Todo AI Tree",
      component: TodoAITreeDisp,
      props: { collapsed: true },
      on: { expand: () => expandComponent(TodoAITreeDisp, { collapsed: true }) },
    },
    {
      name: "Transcript Summarizer",
      component: TranscriptSummarizer,
      props: { collapsed: false },
      on: { expand: () => expandComponent(TranscriptSummarizer, { collapsed: false }) },
    },
    {
      name: "Chat",
      component: Chat,
      props: {
        collapsed: false,
        context: otherContext,
        class: "mb-4",
      },
      on: {
        expand: () => expandComponent(Chat, { collapsed: false, context: otherContext }),
        collapse: () => collapseComponent(Chat, { collapsed: true }), // Note: collapseComponent is not defined in the provided code. Consider if this is needed.
      },
    },
    {
      name: "WooshFriendsTest",
      component: WooshFriendsTest,
      props: { collapsed: true },
      on: { expand: () => expandComponent(WooshFriendsTest, { collapsed: true }) },
    },
    {
      name: "Web View",
      component: WebView,
      props: { collapsed: false },
      on: { expand: () => expandComponent(WebView, { collapsed: false }) },
    },
  ],
};

const componentMap = {
  Calendar,
  Tasks,
  Chat,
  RedditSummaryCard,
  FlexibleChallengeCard,
  TodoAITreeDisp,
  TodoList,
  TreeNotes,
  Woosh,
  WooshFriendsTest,
  TranscriptSummarizer,
  WebView,
};

const shouldLoadContent = computed(() => !apiKeyModalVisible.value); // Only load content if API key is available

/**
 * Fetches the dashboard layout from the API.
 * If successful, updates list1 and list2 with the fetched layout.
 * If fails or no layout is found, defaults to defaultConfig.
 */
async function fetchLayout() {
  if (!shouldLoadContent.value) return; // Do not fetch layout if API key modal is visible

  apiIsLoading.value = true;
  try {
    const response = await fetch("https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/getData?key=DashboardLayout", {
      headers: {
        "X-Api-Key": getApiKey(),
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch layout");
    }
    const data = await response.json();

    if (data.list1 && data.list2) {
      console.log("data.list1", data.list1);
      list1.value = data.list1.map((item) => ({
        ...item,
        component: markRaw(componentMap[item.componentName]),
        on: [...defaultConfig.list1, ...defaultConfig.list2].find((d) => d.name === item.name)?.on || {},
      }));
      list2.value = data.list2.map((item) => ({
        ...item,
        component: markRaw(componentMap[item.componentName]),
        on: [...defaultConfig.list1, ...defaultConfig.list2].find((d) => d.name === item.name)?.on || {},
      }));
    } else {
      // Fallback to default layout if API data is missing lists
      list1.value = defaultConfig.list1;
      list2.value = defaultConfig.list2;
    }
  } catch (error) {
    console.error("Error fetching layout:", error);
    // Fallback to default layout on error
    list1.value = defaultConfig.list1;
    list2.value = defaultConfig.list2;
  } finally {
    apiIsLoading.value = false;
    isLayoutLoaded.value = true;
  }
}

/**
 * Saves the current dashboard layout to the API.
 * Skips saving if API key is not available or layout is not loaded yet.
 */
async function saveLayout() {
  if (!getApiKey() || !isLayoutLoaded.value) return; // Do not save if no API key or layout not loaded

  try {
    const saveData = {
      list1: list1.value.map((item) => ({
        ...item,
        componentName: item.component.__name,
        props: {
          ...item.props,
          collapsed: item.props?.collapsed ?? true, // Ensure collapsed state is saved
        },
        component: undefined, // Remove component and on properties before saving to API
        on: undefined,
      })),
      list2: list2.value.map((item) => ({
        ...item,
        componentName: item.component.__name,
        props: {
          ...item.props,
          collapsed: item.props?.collapsed ?? true, // Ensure collapsed state is saved
        },
        component: undefined, // Remove component and on properties before saving to API
        on: undefined,
      })),
    };

    const response = await fetch("https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/getData?key=DashboardLayout", {
      method: "PUT",
      headers: {
        "X-Api-Key": getApiKey(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(saveData),
    });

    if (!response.ok) {
      throw new Error("Failed to save layout");
    }
    console.log("Layout saved");
  } catch (error) {
    console.error("Error saving layout:", error);
  }
}

// Watch for changes in list1 or list2 to save the layout
watch(
  [list1, list2],
  () => {
    if (shouldLoadContent.value) {
      saveLayout();
    }
  },
  { deep: true }
);

// SECTION: Component Registration and Management (Adding, Removing)
const availableComponents = computed(() => [
  { name: "Calendar", componentName: "Calendar" },
  { name: "Tasks", componentName: "Tasks" },
  { name: "Chat", componentName: "Chat" },
  { name: "Flexible Challenge System", componentName: "FlexibleChallengeCard" },
  { name: "Reddit Summary", componentName: "RedditSummaryCard" },
  { name: "Todo AI Tree", componentName: "TodoAITreeDisp" },
  { name: "Todo List", componentName: "TodoList" },
  { name: "Tree Notes", componentName: "TreeNotes" },
  { name: "Woosh", componentName: "Woosh" },
  { name: "WooshFriendsTest", componentName: "WooshFriendsTest" },
  { name: "Transcript Summarizer", componentName: "TranscriptSummarizer" },
  { name: "Web View", componentName: "WebView" },
]);

const addComponentDialog = ref(false);
const selectedComponent = ref(null);
const newComponentCollapsed = ref(true); // Default collapsed state for new components

/**
 * Adds a new component to the dashboard layout.
 * Uses selectedComponent and newComponentCollapsed refs for configuration.
 */
function addNewComponent() {
  if (!selectedComponent.value) return;

  const component = selectedComponent.value;
  const componentConfig = [...defaultConfig.list1, ...defaultConfig.list2].find((c) => c.name === component.name) || {};

  const newComponent = {
    name: component.name,
    component: markRaw(componentMap[component.componentName]),
    props: {
      ...componentConfig.props,
      collapsed: newComponentCollapsed.value, // Use the checkbox value for collapsed state
    },
    on: componentConfig.on || {},
  };
  console.log("newComponent", newComponent);
  console.log("list1.value", list1.value);

  list1.value = [...list1.value, newComponent]; // Add new component to list1 (left column by default)

  // Reset dialog state
  addComponentDialog.value = false;
  selectedComponent.value = null;
  newComponentCollapsed.value = true; // Reset collapsed state for next component addition
}

/**
 * Removes a component from the specified list at the given index.
 *
 * @param {string} list - The list to remove from ('list1' or 'list2').
 * @param {number} index - The index of the component to remove.
 */
function removeComponent(list, index) {
  if (list === "list1") {
    list1.value = list1.value.filter((_, i) => i !== index);
  } else {
    list2.value = list2.value.filter((_, i) => i !== index);
  }
}

// SECTION: Responsive Layout and Column Resize
const { smAndDown } = useDisplay();
const leftColumnWidth = ref(33); // Initial width percentage for left column

function startResize(e) {
  const startX = e.clientX;
  const startWidth = leftColumnWidth.value;

  function onMouseMove(e) {
    const containerWidth = document.querySelector(".d-flex").offsetWidth;
    const delta = e.clientX - startX;
    const newWidth = startWidth + (delta / containerWidth) * 100;

    // Limit the width between 20% and 80%
    leftColumnWidth.value = Math.min(Math.max(newWidth, 20), 80);
  }

  function onMouseUp() {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

// Combined list for mobile view (smAndDown)
const combinedList = computed(() => {
  if (smAndDown.value) {
    return [...list1.value, ...list2.value]; // Combine lists for mobile view
  }
  return null; // Return null for desktop view, lists are rendered separately
});

// SECTION: Time and Date Display
const showTime = ref(true); // Toggle between dashboard title and time display
const timeKey = ref(0); // Force update time display every second

const currentTime = computed(() => {
  timeKey.value; // Reactive dependency to update time every second
  const now = new Date();
  return now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
});

const currentDate = computed(() => {
  const now = new Date();
  return now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const dayProgress = computed(() => {
  const now = new Date();
  const totalMinutes = now.getHours() * 60 + now.getMinutes();
  return Math.round((totalMinutes / 1440) * 100); // Percentage of day passed
});

const weekProgress = computed(() => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 (Sunday) - 6 (Saturday)
  const totalMinutes = dayOfWeek * 1440 + now.getHours() * 60 + now.getMinutes();
  return Math.round((totalMinutes / (7 * 1440)) * 100); // Percentage of week passed
});

let timeInterval; // Interval for updating time

/**
 * Handles logo click to toggle API key modal visibility.
 */
function logoClick() {
  apiKeyModalVisible.value = true;
}

// SECTION: Weather Data Fetching and Display
const weather = ref(null);
const weatherError = ref(null);
const weatherApiKey = ref(null); // API key for OpenWeatherMap
const notesStore = useNotesStore(); // Using notesStore to fetch API keys

/**
 * Fetches the OpenWeather API key from notesStore and then fetches weather data.
 */
async function fetchWeatherApiKey() {
  if (!weatherApiKey.value) {
    weatherApiKey.value = await notesStore.findApiKey("OpenWeather");
    fetchWeather(); // Fetch weather data immediately after getting API key
  }
}

/**
 * Fetches weather data from OpenWeatherMap API.
 * Uses weatherApiKey ref for API key and hardcoded lat/lon for Calgary.
 * Updates weather ref with fetched data or weatherError ref in case of error.
 */
async function fetchWeather() {
  if (!weatherApiKey.value) return; // Do not fetch weather if API key is not available

  try {
    const response = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=51.050384&lon=-114.078262&units=metric&appid=${weatherApiKey.value}`);
    if (!response.ok) throw new Error("Weather fetch failed");
    weather.value = await response.json();
    weatherError.value = null; // Clear any previous error
  } catch (error) {
    console.error("Error fetching weather:", error);
    weatherError.value = "Unable to load weather data";
  }
}

// SECTION: Lifecycle Hooks
onMounted(() => {
  if (shouldLoadContent.value) {
    fetchLayout(); // Fetch layout on mount if API key is available
  }
  fetchWeatherApiKey(); // Fetch weather API key and then weather data

  // Set up interval to update time every second
  timeInterval = setInterval(() => {
    if (showTime.value) {
      timeKey.value++; // Increment timeKey to trigger time update
    }
  }, 1000);

  // Set up interval to fetch weather data every 15 minutes (900000 ms)
  setInterval(fetchWeather, 900000);
});

onUnmounted(() => {
  clearInterval(timeInterval); // Clear time interval on unmount to prevent memory leaks
});
</script>

<template>
  <v-container fluid class="px-2 px-sm-10">
    <v-row>
      <v-col cols="12">
        <v-card class="text-center bg-transparent" elevation="0">
          <v-card-text>
            <div>
              <transition name="flip" mode="out-in">
                <!-- Dashboard Title View -->
                <h1 v-if="!showTime" class="text-3xl sm:text-6xl font-bold flex items-center justify-center gap-2">
                  <v-icon @click.stop="logoClick">mdi-white-balance-sunny</v-icon>
                  <span @click="showTime = !showTime">Sunny's Dashboard</span>
                  <v-btn icon="mdi-plus" size="small" variant="text" color="grey" class="ml-2" @click="addComponentDialog = true" />
                </h1>

                <!-- Time View -->
                <div v-else class="cursor-pointer p-4 rounded-xl backdrop-blur-md transition-all duration-200 hover:scale-[1.02]" @click="showTime = !showTime">
                  <div class="flex flex-col items-center space-y-2">
                    <!-- Time and Weather Container -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      <!-- Time and Date Section -->
                      <div class="flex flex-col items-center space-y-1">
                        <div class="text-5xl md:text-6xl font-bold text-white font-mono tracking-wider">
                          {{ currentTime }}
                        </div>
                        <div class="text-xl md:text-2xl text-white/90 font-medium">
                          {{ currentDate }}
                        </div>
                      </div>

                      <!-- Weather Section -->
                      <div v-if="weather && !weatherError" class="flex flex-col items-center">
                        <!-- Current Weather -->
                        <div class="flex items-center justify-center gap-2">
                          <img
                            :src="`https://openweathermap.org/img/wn/${weather.current.weather[0].icon}@2x.png`"
                            :alt="weather.current.weather[0].description"
                            class="w-12 h-12"
                          />
                          <span class="text-3xl">{{ Math.round(weather.current.temp) }}°C</span>
                          <span class="text-sm text-white/60"
                            >({{ Math.round(weather.daily[0].temp.min) }}° - {{ Math.round(weather.daily[0].temp.max) }}°)</span
                          >
                          <span class="text-white/60">|</span>
                          <span class="capitalize">{{ weather.current.weather[0].description }}</span>
                        </div>

                        <!-- Additional Weather Info -->
                        <div class="text-sm text-white/60 mt-1 space-y-1">
                          <div class="flex justify-center gap-4">
                            <span>🌡️ {{ Math.round(weather.current.feels_like) }}°C</span>
                            <span>🌬️ {{ Math.round(weather.current.wind_speed) }} m/s</span>
                            <span>💧 {{ weather.current.humidity }}%</span>
                            <span>🌞 {{ Math.round(weather.current.uvi) }}</span>
                          </div>

                          <div class="flex justify-center gap-4"></div>
                          <!-- Daily Summary -->
                          <div class="text-center mt-2 text-white/60">
                            {{ weather.daily[0].summary }}
                          </div>
                        </div>
                      </div>
                      <div v-else-if="weatherError" class="text-red-400 text-sm">
                        {{ weatherError }}
                      </div>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row class="mx-0">
      <div class="d-flex" style="width: 100%">
        <!-- Mobile view -->
        <div v-if="smAndDown" style="width: 100%">
          <draggable v-model="combinedList" group="components" item-key="id" handle=".v-toolbar" :disabled="smAndDown">
            <template #item="{ element, index }">
              <div class="py-1 relative component-wrapper">
                <v-btn icon="mdi-close" size="small" variant="text" color="grey" class="delete-btn" @click="removeComponent('list1', index)" />
                <component :is="element.component" v-bind="element.props" v-on="element.on" />
              </div>
            </template>
          </draggable>
        </div>

        <!-- Desktop view -->
        <template v-else>
          <div :style="{ width: leftColumnWidth + '%' }" class="pr-1">
            <draggable v-model="list1" group="components" item-key="id" handle=".v-toolbar">
              <template #item="{ element, index }">
                <div class="py-2 relative component-wrapper">
                  <v-btn icon="mdi-close" size="small" variant="text" color="grey" class="delete-btn" @click="removeComponent('list1', index)" />
                  <component :is="element.component" v-bind="element.props" v-on="element.on" />
                </div>
              </template>
            </draggable>
          </div>

          <div class="divider" @mousedown="startResize" :style="{ cursor: 'col-resize' }"></div>

          <div :style="{ width: 100 - leftColumnWidth + '%' }" class="pl-1">
            <draggable v-model="list2" group="components" item-key="id" handle=".v-toolbar">
              <template #item="{ element, index }">
                <div class="py-2 relative component-wrapper">
                  <v-btn icon="mdi-close" size="x-small" variant="text" color="grey" class="delete-btn" @click="removeComponent('list2', index)" />
                  <component :is="element.component" v-bind="element.props" v-on="element.on" />
                </div>
              </template>
            </draggable>
          </div>
        </template>
      </div>
    </v-row>
  </v-container>

  <!-- Expansion Dialog -->
  <v-dialog v-model="isExpanded" hide-overlay transition="scale-transition" width="90vw" height="90vh" class="ma-auto">
    <v-card class="h-[90vh]">
      <v-card-text class="expanded-content h-[calc(90vh-64px)]">
        <component :is="expandedComponent" v-bind="expandedProps" :collapsed="false" />
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-dialog v-model="apiKeyModalVisible" persistent max-width="400">
    <v-card>
      <v-card-title class="headline">Enter Password (API key):</v-card-title>
      <v-card-text>
        <v-text-field v-model="enteredApiKey" label="API Key" type="password" autofocus solo @keydown.enter="handleApiKeySubmit(enteredApiKey)" />
        <v-card-subtitle class="text-wrap">
          (This site is intended only for Sunny. Uses API key protected serverless AWS Lambda functions to connect to personalized Google Calendar, Notion, and
          Reddit use cases)
        </v-card-subtitle>
      </v-card-text>
      <v-card-actions>
        <v-btn color="grey darken-1" @click="apiKeyModalVisible = false">Close</v-btn>
        <v-btn color="primary" @click="handleApiKeySubmit(enteredApiKey)">Submit</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="addComponentDialog" max-width="400">
    <v-card>
      <v-card-title>Add New Component</v-card-title>
      <v-card-text>
        <v-select v-model="selectedComponent" :items="availableComponents" item-title="name" label="Select Component" return-object />
        <v-checkbox v-model="newComponentCollapsed" label="Collapsed" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="grey darken-1" @click="addComponentDialog = false">Cancel</v-btn>
        <v-btn color="primary" @click="addNewComponent" :disabled="!selectedComponent">Add</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.component-wrapper {
  position: relative;
}

.component-wrapper .delete-btn {
  position: absolute;
  top: -10px;
  left: -16px;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.component-wrapper:hover .delete-btn {
  opacity: 0.7;
}

.component-wrapper .delete-btn:hover {
  opacity: 1;
}

.divider {
  width: 2px;
  margin: 0 2px;
  transition: background-color 0.2s;
}

.divider:hover {
  background-color: rgba(128, 128, 128, 0.2);
}

.flip-enter-active,
.flip-leave-active {
  transition: all 0.8s;
  transform-style: preserve-3d;
  position: relative;
  backface-visibility: hidden;
}

.flip-enter-from {
  transform: rotateY(-180deg);
}

.flip-leave-to {
  transform: rotateY(180deg);
}

.flip-enter-to,
.flip-leave-from {
  transform: rotateY(0deg);
}
</style>
