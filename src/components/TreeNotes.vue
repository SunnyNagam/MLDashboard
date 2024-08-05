<template>
  <v-card class="mx-auto" elevation="2" rounded="lg">
    <v-toolbar
      color="grey-darken-4"
      dark
      density="compact"
      :border="showNotes ? 'md' : 'none'"
    >
      <v-btn icon @click="toggleNotes">
        <v-icon>{{ showNotes ? "mdi-chevron-up" : "mdi-chevron-down" }}</v-icon>
      </v-btn>
      <v-toolbar-title>Notes</v-toolbar-title>
      <v-btn @click="fetchNotes"><v-icon>mdi-refresh</v-icon></v-btn>
      <v-btn @click="saveNotes"><v-icon>mdi-content-save</v-icon></v-btn>
      <v-btn @click="addNode"><v-icon>mdi-plus</v-icon></v-btn>
      <v-btn @click="undo"><v-icon>mdi-undo</v-icon></v-btn>
    </v-toolbar>

    <v-progress-linear
      v-if="apiIsLoading"
      indeterminate
      class="mx-auto"
    ></v-progress-linear>

    <tree
      v-show="showNotes"
      v-model="notes"
      :data="notes"
      group="notesParent"
    ></tree>
  </v-card>
</template>

<script setup>
import { ref, watch } from "vue";
import Tree from "@/components/Tree.vue";
import { useApi } from "@/useAPI.js";

const { getApiKey } = useApi();
const props = defineProps({ collapsed: { type: Boolean, default: false } });

const showNotes = ref(!props.collapsed);
const notes = ref([]);
const previousNotes = ref([]);
const apiIsLoading = ref(false);

watch(showNotes, (newValue) => newValue && fetchNotes());

function toggleNotes() {
  showNotes.value = !showNotes.value;
}

function addNode() {
  previousNotes.value = JSON.parse(JSON.stringify(notes.value));
  notes.value.push({ text: "", children: [] });
}

function undo() {
  if (previousNotes.value.length > 0) {
    notes.value = JSON.parse(JSON.stringify(previousNotes.value));
  }
}

async function fetchNotes() {
  apiIsLoading.value = true;
  try {
    const response = await fetch(
      "https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/getData?key=Notes",
      {
        headers: { "X-Api-Key": getApiKey() },
      }
    );
    notes.value = await response.json();
    previousNotes.value = JSON.parse(JSON.stringify(notes.value));
  } finally {
    apiIsLoading.value = false;
  }
}

async function saveNotes() {
  apiIsLoading.value = true;
  try {
    await fetch(
      "https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/getData?key=Notes",
      {
        method: "PUT",
        headers: {
          "X-Api-Key": getApiKey(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notes.value),
      }
    );
  } finally {
    apiIsLoading.value = false;
  }
}

if (showNotes.value) {
  fetchNotes();
}
</script>
