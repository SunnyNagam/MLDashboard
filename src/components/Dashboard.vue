<script setup>
import { ref, computed, markRaw } from "vue";
import { useApi } from "@/useAPI.js";
import TodoListCard from "@/components/ToDo/TodoListCard.vue";
import Chat from "@/components/Chat.vue";
import Calendar from "@/components/Calendar.vue";
import TreeNotes from "@/components/TreeNotes.vue";
import TodoAITreeDisp from "@/components/TodoAITreeDisp.vue";
import WooshFriendsTest from "@/components/WooshFriendsTest.vue";
import Woosh from "./Woosh.vue";
import { useTheme, useDisplay } from "vuetify";

const theme = useTheme();
theme.global.name.value = "dark";

const { smAndDown } = useDisplay();
const { setApiKey, getApiKey } = useApi();
const enteredApiKey = ref("");
const apiKeyModalVisible = ref(getApiKey() === null || getApiKey() === "");
const todo = ref({ Now: [{ text: "Loading...", id: "..." }] });
const calendarEvents = ref([]);
const otherContext = `The User is named Sunny, and the current date is ${new Date().toDateString()}.`;

const expandedComponent = ref(null);
const expandedProps = ref({});
const isExpanded = ref(false);

function expandComponent(component, props = {}) {
  expandedComponent.value = markRaw(component);
  expandedProps.value = props;
  isExpanded.value = true;
}

async function fetchTodoData() {
  try {
    const response = await fetch(
      "https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/fetch?list_name=Now",
      {
        headers: {
          "X-Api-Key": getApiKey(),
        },
      }
    );
    const data = await response.json();
    todo.value = data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
async function fetchCalendar() {
  const response = await fetch(
    "https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/getCal",
    {
      headers: {
        "X-Api-Key": getApiKey(),
      },
    }
  );
  const data = await response.json();
  // Helper function to parse a local date string into a local Date object
  const parseGoogleDate = (dateString, isEnd = false) => {
    if (!dateString.includes("T")) {
      const dateParts = dateString.split("-");
      return new Date(
        parseInt(dateParts[0]), // year
        parseInt(dateParts[1]) - 1, // month (zero-based)
        parseInt(dateParts[2]) - (isEnd ? 1 : 0) // day (end dates are exclusive, so subtract 1 day)
      );
    }
    // If it's a datetime string, handle it as a standard date
    return new Date(dateString);
  };
  calendarEvents.value = data.map((event) => {
    return {
      title: event.summary,
      start: parseGoogleDate(event.start.dateTime || event.start.date),
      end: parseGoogleDate(event.end.dateTime || event.end.date, true),
      allDay: !event.start.dateTime,
    };
  });
  calendarEvents.value = calendarEvents.value.slice(0, 10);
}

function getTodoTexts(todoItems) {
  return todoItems
    .reduce((acc, item) => {
      acc.push(item.text + "(id: " + item.id + ")");
      if (item.subTasks) {
        acc.push(...item.subTasks.map((subTask) => `- ${subTask.text}`));
      }
      acc.push("");
      return acc;
    }, [])
    .join("\n");
}

fetchTodoData();
fetchCalendar();

const chatContext = computed(
  () =>
    "**Items on user's todo list (with steps):** \n\n" +
    getTodoTexts(todo.value.Now)
);
const calContext = computed(
  () =>
    "**Items on user's Calendar:** \n\n" +
    calendarEvents.value
      .map(
        (event) =>
          `${
            event.title
          } from ${event.start.toLocaleString()} to ${event.end.toLocaleString()}\n`
      )
      .join("\n")
);

function handleApiKeySubmit(enteredApiKey) {
  setApiKey(enteredApiKey);
  apiKeyModalVisible.value = false;
  // refresh page
  window.location.reload();
}
</script>

<template>
  <v-container fluid class="px-2 px-sm-10">
    <v-row>
      <v-col cols="12">
        <h1 class="text-3xl sm:text-6xl font-bold my-4 text-center">
          <v-icon @click="apiKeyModalVisible = true"
            >mdi-white-balance-sunny</v-icon
          >
          Sunny's Dashboard :)
        </h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="8" order-sm="2">
        <Calendar :collapsed="smAndDown" @expand="expandComponent(Calendar)" />
        <TreeNotes
          :collapsed="true"
          class="mb-4"
          v-if="!smAndDown"
          @expand="expandComponent(TreeNotes)"
        />
        <TodoAITreeDisp
          :collapsed="true"
          class="mb-4"
          @expand="expandComponent(TodoAITreeDisp)"
        />
        <WooshFriendsTest
          :collapsed="true"
          class="mb-4"
          v-if="!smAndDown"
          @expand="expandComponent(WooshFriendsTest)"
        />
      </v-col>
      <v-col cols="12" sm="4" order-sm="1">
        <TodoListCard
          title="Now"
          @expand="expandComponent(TodoListCard, { title: 'Now' })"
        />
        <TodoListCard
          title="Soon"
          :collapsed="true"
          @expand="expandComponent(TodoListCard, { title: 'Soon' })"
        />
        <TodoListCard
          title="Eventually"
          :collapsed="true"
          @expand="expandComponent(TodoListCard, { title: 'Eventually' })"
        />
        <Woosh
          :collapsed="false"
          class="my-4"
          @expand="expandComponent(Woosh)"
        />
        <TreeNotes
          :collapsed="true"
          class="mb-4"
          v-if="smAndDown"
          @expand="expandComponent(TreeNotes)"
        />
        <Chat
          :context="otherContext + '\n' + chatContext + '\n' + calContext"
          :collapsed="false"
          @expand="
            expandComponent(Chat, {
              context: otherContext + '\n' + chatContext + '\n' + calContext,
            })
          "
        />
      </v-col>
    </v-row>
  </v-container>

  <!-- Expansion Dialog -->
  <v-dialog v-model="isExpanded" hide-overlay transition="scale-transition">
    <v-card>
      <v-toolbar color="grey-darken-4" dark>
        <v-btn icon @click="isExpanded = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>{{
          expandedComponent?.name || "Full Screen"
        }}</v-toolbar-title>
      </v-toolbar>
      <v-card-text class="expanded-content">
        <component
          :is="expandedComponent"
          v-bind="expandedProps"
          :collapsed="false"
        />
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-dialog v-model="apiKeyModalVisible" persistent max-width="400">
    <v-card>
      <v-card-title class="headline">Enter Password (API key):</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="enteredApiKey"
          label="API Key"
          type="password"
          autofocus
          solo
          @keydown.enter="handleApiKeySubmit(enteredApiKey)"
        />
        <v-card-subtitle class="text-wrap">
          (This site is intended for personal use. Uses API key protected
          serverless AWS Lambda functions to connect to personalized Google
          Calendar, Notion, and Reddit based tools)
        </v-card-subtitle>
      </v-card-text>
      <v-card-actions>
        <v-btn color="grey darken-4" @click="apiKeyModalVisible = false"
          >Close</v-btn
        >
        <v-btn color="primary" @click="handleApiKeySubmit(enteredApiKey)"
          >Submit</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.expanded-content {
  height: calc(100vh - 64px);
  overflow-y: auto;
}
</style>
