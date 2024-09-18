<script setup>
import TodoListCard from "@/components/ToDo/TodoListCard.vue";
import Chat from "@/components/Chat.vue";
import Calendar from "@/components/Calendar.vue";
import TreeNotes from "@/components/TreeNotes.vue";
import TodoAITreeDisp from "@/components/TodoAITreeDisp.vue";
import WooshFriendsTest from "@/components/WooshFriendsTest.vue";
import Woosh from "./Woosh.vue";

import { ref, computed, shallowRef } from "vue";
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

const list1 = shallowRef([
  {
    name: "Todo List",
    component: TodoListCard,
    props: { collapsed: false },
  },
  { name: "Tree Notes", component: TreeNotes },
  {
    name: "Todo List",
    component: TodoListCard,
    props: { title: "Soon", collapsed: true },
  },
  {
    name: "Woosh",
    component: Woosh,
  },
]);

const list2 = shallowRef([
  { name: "Calendar", component: Calendar, props: { collapsed: false } },
  {
    name: "Todo AI Tree",
    component: TodoAITreeDisp,
    props: { collapsed: true },
  },
  {
    name: "Chat",
    component: Chat,
    props: {
      collapsed: false,
      context: otherContext,
      class: "mb-4",
    },
  },
  {
    name: "WooshFriendsTest",
    component: WooshFriendsTest,
    props: {
      collapsed: true,
    },
  },
]);

function logoClick() {
  apiKeyModalVisible.value = true;
}

function handleApiKeySubmit(enteredApiKey) {
  setApiKey(enteredApiKey);
  apiKeyModalVisible.value = false;
  window.location.reload();
}
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
      <v-col cols="6">
        <draggable
          v-model="list1"
          group="components"
          item-key="id"
          handle=".v-toolbar"
        >
          <template #item="{ element }">
            <div class="py-2">
              <component :is="element.component" v-bind="element.props" />
            </div>
          </template>
        </draggable>
      </v-col>
      <v-col cols="6">
        <draggable
          v-model="list2"
          group="components"
          item-key="id"
          handle=".v-toolbar"
        >
          <template #item="{ element }">
            <div class="py-2">
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
