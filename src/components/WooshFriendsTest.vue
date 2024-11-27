<template>
  <v-card class="mx-auto" elevation="2" rounded="lg">
    <v-toolbar color="grey-darken-4" dark density="compact">
      <v-btn icon @click="showNotes = !showNotes">
        <v-icon>{{ showNotes ? "mdi-chevron-up" : "mdi-chevron-down" }}</v-icon>
      </v-btn>
      <v-toolbar-title>Woosh Friends</v-toolbar-title>
      <v-btn icon="mdi-refresh" x-small @click="fetchNotes" />
    </v-toolbar>

    <v-progress-linear v-if="apiIsLoading" indeterminate class="mx-auto"></v-progress-linear>

    <div v-show="showNotes">
      <v-list>
        <v-list-group v-for="(friend, name) in notes" :key="name" :value="name" no-action>
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              :title="name"
              :subtitle="'Last Changed: ' + new Date(friend.last_updated).toISOString().split('T')[0]"
              class="text-h6"
            ></v-list-item>
          </template>

          <v-list-item v-for="(value, keyName) in friend" :key="keyName">
            <template v-if="keyName !== 'last_updated'">
              <v-list-item-title class="font-weight-bold text-subtitle-1"> {{ keyName }}: </v-list-item-title>
              <v-list-item-subtitle>
                <v-chip v-for="(item, index) in value" :key="index" class="ma-1" color="primary" variant="outlined">
                  {{ item }}
                </v-chip>
              </v-list-item-subtitle>
            </template>
          </v-list-item>
        </v-list-group>
      </v-list>
    </div>
  </v-card>
</template>

<script setup>
import { ref, watch } from "vue";
import { VBtn } from "vuetify/lib/components/index.mjs";
import Tree from "@/components/Tree.vue";
import { useApi } from "@/useAPI.js";
const { setApiKey, getApiKey } = useApi();

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
});
const showNotes = ref(true);
const notes = ref([]);
const previousNotes = ref([]); // Store previous state for undo

watch(
  () => showNotes.value,
  (newValue) => {
    if (newValue) {
      fetchNotes();
    }
  }
);
const apiIsLoading = ref(false);

function updateData(val) {
  notes.value = val;
}

function addNode() {
  previousNotes.value = JSON.parse(JSON.stringify(notes.value)); // Save current state
  notes.value.push({
    text: "",
    children: [],
  });
}

function undo() {
  if (previousNotes.value.length > 0) {
    notes.value = JSON.parse(JSON.stringify(previousNotes.value)); // Restore previous state
  }
}

const fetchNotes = async () => {
  apiIsLoading.value = true;
  const response = await fetch("https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/getData?key=WooshFriendsProcessed", {
    headers: {
      "X-Api-Key": getApiKey(),
    },
  });
  const data = await response.json();
  notes.value = data;
  previousNotes.value = JSON.parse(JSON.stringify(notes.value)); // Save current state
  apiIsLoading.value = false;
};

const saveNotes = async () => {
  apiIsLoading.value = true;
  const response = await fetch("https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/getData?key=WooshFriendsProcessed", {
    method: "PUT",
    headers: {
      "X-Api-Key": getApiKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(notes.value),
  });
  const data = await response.json();
  console.log(notes.value);
  console.log(data);
  apiIsLoading.value = false;
};

if (props.collapsed) {
  showNotes.value = false;
}

if (showNotes.value) {
  fetchNotes();
}
</script>
