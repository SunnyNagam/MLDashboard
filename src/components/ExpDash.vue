<script setup>
import { ref, computed, shallowRef } from "vue";
import { useApi } from "@/useAPI.js";
import TodoListCard from "@/components/TodoListCard.vue";
import Chat from "@/components/Chat.vue";
import Calendar from "@/components/Calendar.vue";
import TreeNotes from "@/components/TreeNotes.vue";
import { useDisplay } from "vuetify";
import draggable from "vuedraggable";

const { smAndDown } = useDisplay();
const { setApiKey, getApiKey } = useApi();
const enteredApiKey = ref("");
const apiKeyModalVisible = ref(getApiKey() === null || getApiKey() === "");

const otherContext = `The User is named Sunny, and the current date is ${new Date().toDateString()}.`;

function logoClick() {
  apiKeyModalVisible.value = true;
}

function handleApiKeySubmit(enteredApiKey) {
  setApiKey(enteredApiKey);
  apiKeyModalVisible.value = false;
  // refresh page
  window.location.reload();
}

const components = shallowRef([
  {
    id: 3,
    component: TodoListCard,
    props: { collapsed: false, class: "mb-4" },
  },
  {
    id: 2,
    component: TreeNotes,
    props: { collapsed: false, class: "mb-4" },
  },
  {
    id: 4,
    component: Chat,
    props: {
      collapsed: false,
      context: otherContext,
      class: "mb-4",
    },
  },
  { id: 1, component: Calendar, props: { collapsed: false, class: "mb-4" } },
]);
</script>

<template>
  <v-container fluid class="px-2 px-sm-10">
    <v-row>
      <v-col cols="12">
        <h1 class="text-3xl sm:text-6xl font-bold my-4 text-center">
          <v-icon @click="logoClick">mdi-white-balance-sunny</v-icon>
          Sunny's Dashboard
        </h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <draggable
          v-model="components"
          group="components"
          animation="200"
          item-key="id"
          handle=".v-toolbar"
        >
          <template #item="{ element }">
            <div>
              <component :is="element.component" v-bind="element.props" />
            </div>
          </template>
        </draggable>
      </v-col>
    </v-row>
  </v-container>
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
          (This site is intended only for Sunny. Uses API key protected
          serverless AWS Lambda functions to connect to personalized Google
          Calendar, Notion, and Reddit use cases)
        </v-card-subtitle>
      </v-card-text>
      <v-card-actions>
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
