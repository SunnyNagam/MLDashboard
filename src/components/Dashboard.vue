<script setup>
import { ref, computed } from "vue";
import { useApi } from "@/useAPI.js";
import TodoListCard from "@/components/TodoListCard.vue";
import Chat from "@/components/Chat.vue";
import Calendar from "@/components/Calendar.vue";
import { useDisplay } from "vuetify";

const { smAndDown } = useDisplay();
const { setApiKey, getApiKey } = useApi();
const enteredApiKey = ref("");
const apiKeyModalVisible = ref(false);
const todo = ref({ Now: [{ text: "Loading...", id: "..." }] });

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

function getTodoTexts(todoItems) {
  return todoItems
    .reduce((acc, item) => {
      acc.push(item.text);
      if (item.subTasks) {
        acc.push(...item.subTasks.map((subTask) => `- ${subTask.text}`));
      }
      acc.push("");
      return acc;
    }, [])
    .join("\n");
}

fetchTodoData();

const chatContext = computed(
  () =>
    "Use the following information only if helpful: Items on user's todo list (with steps): \n\n" +
    getTodoTexts(todo.value.Now)
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
          Sunny's Dashboard
        </h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="8" order-sm="2">
        <Calendar :collapsed="smAndDown" />
      </v-col>
      <v-col cols="12" sm="4" order-sm="1">
        <TodoListCard title="Now" />
        <TodoListCard title="Soon" :collapsed="true" />
        <TodoListCard title="Eventually" :collapsed="true" />
        <Chat :context="chatContext" />
      </v-col>
    </v-row>
  </v-container>
  <v-dialog v-model="apiKeyModalVisible" persistent max-width="290">
    <v-card>
      <v-card-title class="headline">Enter API Key</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="enteredApiKey"
          label="API Key"
          type="password"
          autofocus
          solo
          @keydown.enter="handleApiKeySubmit(enteredApiKey)"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey darken-1" @click="apiKeyModalVisible = false"
          >Close</v-btn
        >
        <v-btn color="primary" @click="handleApiKeySubmit(enteredApiKey)"
          >Submit</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
