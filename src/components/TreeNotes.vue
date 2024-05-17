<template>
  <v-card class="mx-auto mb-4" elevation="2" rounded="lg">
    <v-toolbar color="teal" density="compact">
      <v-btn icon @click="showNotes = !showNotes">
        <v-icon>{{ showNotes ? "mdi-chevron-up" : "mdi-chevron-down" }}</v-icon>
      </v-btn>
      <v-toolbar-title>Notes</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn @click="fetchNotes"><v-icon>mdi-refresh</v-icon></v-btn>
      <v-btn @click="saveNotes"><v-icon>mdi-content-save</v-icon></v-btn>
      <v-btn @click="addNode"><v-icon>mdi-plus</v-icon></v-btn>
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

if (props.collapsed) {
  showNotes.value = false;
}

if (showNotes.value) {
  fetchNotes();
}
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
  notes.value.push({
    text: "",
    children: [],
  });
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
  apiIsLoading.value = false;
};

const saveNotes = async () => {
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
  console.log(data);
};
</script>
