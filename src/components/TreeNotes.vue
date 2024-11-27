<template>
  <v-card :class="[$attrs.class, 'mx-auto', isExpanded ? 'h-full d-flex flex-column' : '']" elevation="2" rounded="lg">
    <v-toolbar color="grey-darken-4" dark density="compact">
      <v-btn icon @click="toggleNotes">
        <v-icon>{{ showNotes ? "mdi-chevron-up" : "mdi-chevron-down" }}</v-icon>
      </v-btn>
      <v-toolbar-title>Notes</v-toolbar-title>
      <v-btn icon="mdi-refresh" size="small" @click="fetchNotes" />
      <v-btn icon="mdi-content-save" size="small" @click="saveNotes" />
      <v-btn icon="mdi-plus" size="small" @click="addNode" />
      <v-btn icon="mdi-undo" size="small" @click="undo" />
      <v-btn icon="mdi-arrow-expand" size="small" @click="$emit('expand')" />
    </v-toolbar>

    <v-progress-linear v-if="apiIsLoading" indeterminate class="mx-auto"></v-progress-linear>

    <tree v-show="showNotes" v-model="notes" :data="notes" group="notesParent"></tree>
  </v-card>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import Tree from "@/components/Tree.vue";
import { useApi } from "@/useAPI.js";
import { useNotesStore } from "@/stores/useNotesStore";

const { getApiKey } = useApi();
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

const showNotes = ref(!props.collapsed);
const notes = ref([]);
const previousNotes = ref([]);
const apiIsLoading = ref(false);
const notesStore = useNotesStore();

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
    notes.value = await notesStore.fetchNotes();
    previousNotes.value = JSON.parse(JSON.stringify(notes.value));
  } finally {
    apiIsLoading.value = false;
  }
}

async function saveNotes() {
  apiIsLoading.value = true;
  try {
    await fetch("https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/getData?key=Notes", {
      method: "PUT",
      headers: {
        "X-Api-Key": getApiKey(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notes.value),
    });
  } finally {
    apiIsLoading.value = false;
  }
}

if (showNotes.value) {
  fetchNotes();
}

// Add emit declaration
defineEmits(["expand"]);
</script>
