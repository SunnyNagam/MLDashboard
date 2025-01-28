<script setup>
import TodoListCard from "@/components/ToDo/TodoListCard.vue";
import Chat from "@/components/Chat.vue";
import Calendar from "@/components/Calendar.vue";
import TreeNotes from "@/components/TreeNotes.vue";
import TodoAITreeDisp from "@/components/TodoAITreeDisp.vue";
import WooshFriendsTest from "@/components/WooshFriendsTest.vue";
import RedditSummaryCard from "@/components/RedditSummaryCard.vue";
import Woosh from "./Woosh.vue";
import { useNotesStore } from "@/stores/useNotesStore";

import { ref, computed, shallowRef, markRaw, onMounted, watch, onUnmounted } from "vue";
import { useApi } from "@/useAPI.js";
import { useTheme, useDisplay } from "vuetify";
import draggable from "vuedraggable";

const { smAndDown } = useDisplay();
const { setApiKey, getApiKey } = useApi();
const enteredApiKey = ref("");
const apiKeyModalVisible = ref(getApiKey() === null || getApiKey() === "");

const theme = useTheme();
theme.global.name.value = "dark";

const otherContext = `The User is named Sunny, and the current date is ${new Date().toDateString()}.`;
const notesStore = useNotesStore();
const weatherApiKey = ref(null);
const expandedComponent = ref(null);
const expandedProps = ref({});
const isExpanded = ref(false);

function expandComponent(component, props = {}) {
  expandedComponent.value = markRaw(component);
  expandedProps.value = { ...props, isExpanded: true };
  isExpanded.value = true;
}

const apiIsLoading = ref(false);
const showTime = ref(true);

const list1 = shallowRef([]);
const list2 = shallowRef([]);
const isLayoutLoaded = ref(false);

async function fetchWeatherApiKey() {
  if (!weatherApiKey.value) {
    weatherApiKey.value = await notesStore.findApiKey("OpenWeather");
    fetchWeather();
  }
}

const defaultConfig = {
  list1: [
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
      name: "Chat",
      component: Chat,
      props: {
        collapsed: false,
        context: otherContext,
        class: "mb-4",
      },
      on: {
        expand: () => expandComponent(Chat, { collapsed: false, context: otherContext }),
        collapse: () => collapseComponent(Chat, { collapsed: true }),
      },
    },
    {
      name: "WooshFriendsTest",
      component: WooshFriendsTest,
      props: { collapsed: true },
      on: { expand: () => expandComponent(WooshFriendsTest, { collapsed: true }) },
    },
  ],
};

// Add a component map to lookup components by name
const componentMap = {
  TodoListCard,
  Chat,
  Calendar,
  TreeNotes,
  TodoAITreeDisp,
  WooshFriendsTest,
  Woosh,
  RedditSummaryCard,
};

// Add a computed property to check if we should load content
const shouldLoadContent = computed(() => !apiKeyModalVisible.value);

// Modify fetchLayout to check shouldLoadContent
async function fetchLayout() {
  if (!shouldLoadContent.value) return;

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
      // Use componentMap instead of eval
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
      list1.value = defaultConfig.list1;
      list2.value = defaultConfig.list2;
    }
  } catch (error) {
    console.error("Error fetching layout:", error);
    list1.value = defaultConfig.list1;
    list2.value = defaultConfig.list2;
  } finally {
    apiIsLoading.value = false;
    isLayoutLoaded.value = true;
  }
}

async function saveLayout() {
  if (!getApiKey() || !isLayoutLoaded.value) return;

  try {
    const saveData = {
      list1: list1.value.map((item) => ({
        ...item,
        componentName: item.component.__name,
        props: {
          ...item.props,
          collapsed: item.props?.collapsed ?? true, // Save collapsed state
        },
        component: undefined,
        on: undefined,
      })),
      list2: list2.value.map((item) => ({
        ...item,
        componentName: item.component.__name,
        props: {
          ...item.props,
          collapsed: item.props?.collapsed ?? true, // Save collapsed state
        },
        component: undefined,
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

// Modify watch to check shouldLoadContent
watch(
  [list1, list2],
  () => {
    if (shouldLoadContent.value) {
      saveLayout();
    }
  },
  { deep: true }
);

let timeInterval;
// Modify onMounted to check shouldLoadContent
onMounted(() => {
  if (shouldLoadContent.value) {
    fetchLayout();
  }
  fetchWeatherApiKey();

  timeInterval = setInterval(() => {
    if (showTime.value) {
      timeKey.value++;
    }
  }, 1000);
  setInterval(fetchWeather, 900000);
});

function logoClick() {
  apiKeyModalVisible.value = true;
}

function handleApiKeySubmit(enteredApiKey) {
  setApiKey(enteredApiKey);
  apiKeyModalVisible.value = false;
  window.location.reload();
}

const availableComponents = computed(() => [
  { name: "Todo List", componentName: "TodoListCard" },
  { name: "Tree Notes", componentName: "TreeNotes" },
  { name: "Calendar", componentName: "Calendar" },
  { name: "Chat", componentName: "Chat" },
  { name: "Todo AI Tree", componentName: "TodoAITreeDisp" },
  { name: "Woosh", componentName: "Woosh" },
  { name: "WooshFriendsTest", componentName: "WooshFriendsTest" },
  { name: "Reddit Summary", componentName: "RedditSummaryCard" },
]);

const addComponentDialog = ref(false);
const selectedComponent = ref(null);
// Add this ref for the collapsed state
const newComponentCollapsed = ref(true);

function addNewComponent() {
  if (!selectedComponent.value) return;

  const component = selectedComponent.value;
  const componentConfig = [...defaultConfig.list1, ...defaultConfig.list2].find((c) => c.name === component.name) || {};

  const newComponent = {
    name: component.name,
    component: markRaw(componentMap[component.componentName]),
    props: {
      ...componentConfig.props,
      collapsed: newComponentCollapsed.value, // Use the checkbox value
    },
    on: componentConfig.on || {},
  };

  list1.value = [...list1.value, newComponent];

  addComponentDialog.value = false;
  selectedComponent.value = null;
  newComponentCollapsed.value = true; // Reset to default
}

function removeComponent(list, index) {
  if (list === "list1") {
    list1.value = list1.value.filter((_, i) => i !== index);
  } else {
    list2.value = list2.value.filter((_, i) => i !== index);
  }
}

// Add these new refs and functions
const leftColumnWidth = ref(33); // Initial width percentage

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

// Add this computed property after other computed properties
const combinedList = computed(() => {
  if (smAndDown.value) {
    // Combine both lists for mobile view
    return [...list1.value, ...list2.value];
  }
  return null;
});

// Add these computed properties
const timeKey = ref(0);

const currentTime = computed(() => {
  timeKey.value;
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
  return Math.round((totalMinutes / 1440) * 100);
});

const weekProgress = computed(() => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const totalMinutes = dayOfWeek * 1440 + now.getHours() * 60 + now.getMinutes();
  return Math.round((totalMinutes / (7 * 1440)) * 100);
});


onUnmounted(() => {
  clearInterval(timeInterval);
});

// Add these new refs for weather
const weather = ref(null);
const weatherError = ref(null);

// Add this function to fetch weather data
async function fetchWeather() {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=51.050384lon=--114.078262&units=metric&appid=${weatherApiKey.value}`
    );
    if (!response.ok) throw new Error('Weather fetch failed');
    weather.value = await response.json();
    console.log(weather.value);
    weatherError.value = null;
  } catch (error) {
    console.error('Error fetching weather:', error);
    weatherError.value = 'Unable to load weather data';
  }
}
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
                          <span class="text-sm text-white/60">({{ Math.round(weather.daily[0].temp.min) }}° - {{ Math.round(weather.daily[0].temp.max) }}°)</span>
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

                          <div class="flex justify-center gap-4">
                          </div>
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
