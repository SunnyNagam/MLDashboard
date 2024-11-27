<template>
  <v-card :class="[$attrs.class, 'mx-auto']" elevation="2" rounded="lg">
    <v-toolbar color="grey-darken-4" dark density="compact">
      <v-btn icon @click="showNotes = !showNotes">
        <v-icon>{{ showNotes ? "mdi-chevron-up" : "mdi-chevron-down" }}</v-icon>
      </v-btn>
      <v-toolbar-title>Woosh</v-toolbar-title>
      <v-btn icon="mdi-refresh" @click="fetchNotes" />
      <v-btn icon="mdi-send" @click="saveNote" />
      <v-btn icon="mdi-magnify" @click="openSearchModal" />
      <v-btn icon="mdi-arrow-expand" @click="$emit('expand')" />
    </v-toolbar>

    <v-progress-linear v-if="apiIsLoading" indeterminate class="mx-auto"></v-progress-linear>

    <div v-show="showNotes">
      <v-card-text>
        <v-textarea v-model="noteContent" label="Type your note..." rows="3" auto-grow outlined hide-details></v-textarea>
        <v-text-field v-model="category" label="Category (optional)" class="mt-2"></v-text-field>
        <v-alert v-if="statusMessage" :type="statusMessage.includes('Error') ? 'error' : 'success'" class="mt-2" dense>
          {{ statusMessage }}
        </v-alert>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-text class="notes-list" style="max-height: 300px; overflow-y: auto">
        <v-list v-if="displayNotes.length">
          <v-list-item v-for="note in displayNotes" :key="note.id || note.timetaken" @click="showFullNote(note)">
            <v-list-item-title>{{ note.text }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ formatDateTime(note.timetaken) }}
              {{ note.category !== "unspecified" ? ` (${note.category})` : "" }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
        <div v-else-if="notesLoaded">No notes found.</div>
      </v-card-text>
    </div>

    <v-dialog v-model="searchModalOpen" max-width="500px">
      <v-card>
        <v-card-title>Search Notes</v-card-title>
        <v-card-text>
          <v-tabs v-model="searchTab">
            <v-tab value="dates">By Dates</v-tab>
            <v-tab value="query">By Query</v-tab>
          </v-tabs>
          <v-window v-model="searchTab">
            <v-window-item value="dates">
              <v-row>
                <v-col cols="6">
                  <v-text-field v-model="startDate" label="Start Date" type="date"></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="endDate" label="End Date" type="date"></v-text-field>
                </v-col>
              </v-row>
            </v-window-item>
            <v-window-item value="query">
              <v-text-field v-model="searchQuery" label="Search Query"></v-text-field>
              <v-text-field v-model="topK" label="Top K (optional)" type="number"></v-text-field>
            </v-window-item>
          </v-window>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" text @click="searchModalOpen = false">Close</v-btn>
          <v-btn color="blue-darken-1" text @click="performSearch">Search</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="fullNoteDialog" max-width="500px">
      <v-card v-if="selectedNote">
        <v-card-title>Full Note</v-card-title>
        <v-card-text>
          <p><strong>Text:</strong> {{ selectedNote.text }}</p>
          <p>
            <strong>Category:</strong>
            {{ selectedNote.category || "Unspecified" }}
          </p>
          <p><strong>Date:</strong> {{ formatDateTime(selectedNote.timetaken) }}</p>
          <p v-if="selectedNote.score !== undefined">
            <strong>Relevance Score:</strong>
            {{ selectedNote.score.toFixed(2) }}
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" text @click="fullNoteDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, computed } from "vue";
import { useApi } from "@/useAPI.js";

const { getApiKey } = useApi();

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
});

const showNotes = ref(!props.collapsed);
const noteContent = ref("");
const category = ref("");
const notes = ref([]);
const apiIsLoading = ref(false);
const notesLoaded = ref(false);
const statusMessage = ref("");

const searchModalOpen = ref(false);
const searchTab = ref("dates");
const startDate = ref("");
const endDate = ref("");
const searchQuery = ref("");
const topK = ref("");

const fullNoteDialog = ref(false);
const selectedNote = ref(null);

const displayNotes = computed(() => {
  if (Array.isArray(notes.value)) {
    return notes.value;
  } else if (notes.value && notes.value.matches) {
    return notes.value.matches.map((match) => ({
      ...match.metadata,
      score: match.score,
    }));
  }
  return [];
});

function formatDateTime(dateTimeString) {
  const date = new Date(dateTimeString);
  return `${date.toISOString().split("T")[0]} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function openSearchModal() {
  searchModalOpen.value = true;
}

async function performSearch() {
  apiIsLoading.value = true;
  try {
    let url = "https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/woosh?";
    if (searchTab.value === "dates") {
      if (startDate.value) url += `start=${startDate.value}&`;
      if (endDate.value) url += `end=${endDate.value}&`;
    } else {
      url += `query=${encodeURIComponent(searchQuery.value)}&`;
      if (topK.value) url += `topK=${topK.value}&`;
    }

    const response = await fetch(url.slice(0, -1), {
      headers: {
        "X-Api-Key": getApiKey(),
      },
    });

    if (response.ok) {
      notes.value = await response.json();
      notesLoaded.value = true;
      searchModalOpen.value = false;
    } else {
      console.error("Error searching notes:", await response.text());
    }
  } catch (error) {
    console.error("Error searching notes:", error);
  } finally {
    apiIsLoading.value = false;
  }
}

async function saveNote() {
  if (noteContent.value.trim()) {
    apiIsLoading.value = true;
    statusMessage.value = "";
    try {
      const response = await fetch("https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/woosh", {
        method: "POST",
        headers: {
          "X-Api-Key": getApiKey(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: noteContent.value,
          ...(category.value && { category: category.value }),
        }),
      });
      if (response.ok) {
        noteContent.value = "";
        category.value = "";
        statusMessage.value = "Note saved successfully!";
      } else {
        statusMessage.value = "Error saving note. Please try again.";
        console.error("Error saving note:", await response.text());
      }
    } catch (error) {
      statusMessage.value = "Error saving note. Please try again.";
      console.error("Error saving note:", error);
    } finally {
      apiIsLoading.value = false;
    }
  }
}

async function fetchNotes() {
  apiIsLoading.value = true;
  try {
    const response = await fetch("https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/woosh", {
      headers: {
        "X-Api-Key": getApiKey(),
      },
    });
    if (response.ok) {
      notes.value = await response.json();
      notesLoaded.value = true;
    } else {
      console.error("Error fetching notes:", await response.text());
    }
  } catch (error) {
    console.error("Error fetching notes:", error);
  } finally {
    apiIsLoading.value = false;
  }
}

function showFullNote(note) {
  selectedNote.value = note;
  fullNoteDialog.value = true;
}
</script>

<style scoped>
.notes-list {
  max-height: 300px;
  overflow-y: auto;
}
:deep(.v-toolbar) .v-btn {
  --v-btn-size: small;
}
</style>
