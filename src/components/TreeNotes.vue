<template>
  <v-card class="mx-auto" elevation="2" rounded="lg">
    <v-toolbar
      color="grey-darken-4"
      dark
      density="compact"
      :border="showNotes ? 'md' : 'none'"
    >
      <v-btn icon @click="showNotes = !showNotes">
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

    <div v-show="showNotes">
      <tree
        v-model="notes"
        :data="notes"
        group="notesParent"
        @input="updateData"
      >
      </tree>
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
  const response = await fetch(
    "https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/getData?key=Notes",
    {
      headers: {
        "X-Api-Key": getApiKey(),
      },
    }
  );
  const data = await response.json();
  notes.value = data;
  previousNotes.value = JSON.parse(JSON.stringify(notes.value)); // Save current state
  apiIsLoading.value = false;
};

const saveNotes = async () => {
  apiIsLoading.value = true;
  const response = await fetch(
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
