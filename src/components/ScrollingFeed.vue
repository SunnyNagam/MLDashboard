<template>
  <div
    :class="['scrolling-feed-wrapper', { transparent: settings.transparency }]"
    :style="{ '--scroll-duration': `${settings.scrollSpeed}s` }"
    @dblclick="openSettingsDialog"
  >
    <div class="scrolling-feed">
      <span
        v-for="(item, index) in feedItems"
        :key="item.id || index"
        class="scrolling-item px-6 flex-shrink-0"
      >
        <v-card
          class="bg-transparent shadow-none d-flex align-center elevation-0"
        >
          <v-img
            :src="item.thumbnail"
            :alt="item.title"
            class="mr-4 rounded"
            width="50"
            height="50"
          ></v-img>
          <v-card-text>
            <h3 class="text-xl font-semibold">{{ item.title }}</h3>
            <p class="text-sm">{{ item.description }}</p>
          </v-card-text>
        </v-card>
      </span>
    </div>

    <!-- Settings and Feed Items Modal -->
    <v-dialog v-model="isSettingsDialogOpen" max-width="800px">
      <v-card>
        <v-card-title> Manage Feed Items & Settings </v-card-title>
        <v-card-text>
          <v-form ref="feedForm" v-model="isFormValid">
            <v-container fluid>
              <v-row>
                <v-col cols="12" md="6">
                  <h3>Feed Items</h3>
                  <v-btn color="primary" @click="addItem">Add Item</v-btn>
                  <v-divider class="my-4"></v-divider>
                  <v-list>
                    <v-list-item
                      v-for="(item, index) in feedItems"
                      :key="item.id || index"
                    >
                      <v-list-item-content>
                        <v-text-field
                          v-model="item.title"
                          label="Title"
                          :rules="[(v) => !!v || 'Title is required']"
                          required
                        ></v-text-field>
                        <v-textarea
                          v-model="item.description"
                          label="Description"
                          :rules="[(v) => !!v || 'Description is required']"
                          required
                        ></v-textarea>
                        <v-text-field
                          v-model="item.thumbnail"
                          label="Thumbnail URL"
                          :rules="[
                            (v) => !!v || 'Thumbnail URL is required',
                            (v) => isValidUrl(v) || 'Enter a valid URL',
                          ]"
                          required
                        ></v-text-field>
                      </v-list-item-content>
                      <v-list-item-action>
                        <v-btn icon @click="removeItem(index)">
                          <v-icon color="red">mdi-delete</v-icon>
                        </v-btn>
                      </v-list-item-action>
                    </v-list-item>
                  </v-list>
                </v-col>

                <v-col cols="12" md="6">
                  <h3>Settings</h3>
                  <v-text-field
                    v-model.number="settings.scrollSpeed"
                    label="Scroll Speed (seconds)"
                    type="number"
                    :rules="[(v) => v > 0 || 'Scroll speed must be positive']"
                    required
                  ></v-text-field>
                  <v-switch
                    v-model="settings.transparency"
                    label="Transparent Background"
                  ></v-switch>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeSettingsDialog">Cancel</v-btn>
          <v-btn :disabled="!isFormValid" color="primary" @click="saveSettings">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Loading Indicator -->
    <v-progress-linear
      v-if="apiIsLoading || isSaving"
      indeterminate
      color="green"
      class="mt-2"
    ></v-progress-linear>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import { useApi } from "@/useAPI.js";

const { getApiKey } = useApi();

// Reactive state for feed items and loading status
const feedItems = ref([]);
const apiIsLoading = ref(false);
const isSaving = ref(false);

// Reactive state for settings
const settings = reactive({
  transparency: false,
  scrollSpeed: 30, // default scroll speed in seconds
});

// Reactive state for settings dialog
const isSettingsDialogOpen = ref(false);
const isFormValid = ref(false);
const feedForm = ref(null);

// Function to fetch feed items from the API
const fetchFeedItems = async () => {
  apiIsLoading.value = true;
  try {
    const response = await fetch(
      "https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/getData?key=ASSKBanner",
      {
        headers: { "X-Api-Key": getApiKey() },
      }
    );
    const data = await response.json();
    feedItems.value = data.feedItems;
    settings.value = data.settings;
  } catch (error) {
    console.error("Error fetching feed items:", error);
  } finally {
    apiIsLoading.value = false;
  }
};

// Function to validate URLs
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Lifecycle hook to fetch feed items on mount
onMounted(() => {
  fetchFeedItems();
});

// Functions to manage the settings and feed items dialog
const openSettingsDialog = () => {
  isSettingsDialogOpen.value = true;
};

const closeSettingsDialog = () => {
  isSettingsDialogOpen.value = false;
};

const addItem = () => {
  feedItems.value.push({
    id: Date.now(), // Temporary unique ID
    title: "",
    description: "",
    thumbnail: "",
  });
};

const removeItem = (index) => {
  feedItems.value.splice(index, 1);
};

// Function to save settings and feed items
const saveSettings = async () => {
  if (!feedForm.value.validate()) {
    return;
  }

  isSaving.value = true;
  try {
    const payload = {
      feedItems: feedItems.value,
      settings: settings,
    };
    const response = await fetch(
      "https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/getData?key=ASSKBanner",
      {
        method: "PUT",
        headers: {
          "X-Api-Key": getApiKey(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to save settings and feed items.");
    }

    // Optionally, re-fetch the feed items to ensure synchronization
    await fetchFeedItems();

    closeSettingsDialog();
  } catch (error) {
    console.error("Error saving settings and feed items:", error);
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
.scrolling-feed-wrapper {
  position: fixed;
  bottom: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  overflow: hidden;
  white-space: nowrap;
  transition: background 0.3s ease;
}

.scrolling-feed-wrapper.transparent {
  background: rgba(0, 0, 0, 0.3);
}

.scrolling-feed {
  display: flex;
  animation: var(--scroll-duration, 30s) linear 1s scroll-left infinite;
}

.scrolling-item {
  min-width: 400px;
  cursor: pointer; /* Indicate that items are interactive */
}

.scrolling-feed-wrapper :global(.scrolling-feed) {
  animation-duration: var(--scroll-duration, 30s);
}

/* Keyframes for scrolling animation */
@keyframes scroll-left {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(-100%);
  }
}

/* Pause animation on hover */
.scrolling-feed-wrapper:hover .scrolling-feed {
  animation-play-state: paused;
}
</style>
