<template>
  <div
    :class="['scrolling-feed-wrapper']"
    :style="{
      '--scroll-duration': `${settings.scrollSpeed}s`,
      '--transparency': settings.transparency,
    }"
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
            <h3 class="text-xl font-semibold">
              {{ item.title }}
              <a
                v-if="item.link"
                :href="item.link"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-500 ml-2"
              >
                Learn More
              </a>
            </h3>
            <p class="text-sm">{{ item.description }}</p>
          </v-card-text>
        </v-card>
      </span>
    </div>

    <!-- Settings and Feed Items Modal -->
    <v-dialog v-model="isSettingsDialogOpen">
      <v-card>
        <v-card-title>Manage Feed Items & Settings</v-card-title>
        <v-card-text>
          <v-form ref="feedForm" v-model="isFormValid">
            <v-container fluid>
              <v-row>
                <v-col cols="12" md="6">
                  <h3 class="mb-4">Feed Items</h3>
                  <v-btn color="primary" @click="addItem" class="mb-4">
                    <v-icon left>mdi-plus</v-icon>Add Item
                  </v-btn>
                  <v-expansion-panels multiple>
                    <v-expansion-panel
                      v-for="(item, index) in feedItems"
                      :key="item.id || index"
                    >
                      <v-expansion-panel-title>
                        {{ item.title || "Untitled Item" }}
                      </v-expansion-panel-title>
                      <v-expansion-panel-text>
                        <v-card flat>
                          <v-card-text>
                            <v-row>
                              <v-col cols="12">
                                <v-text-field
                                  v-model="item.title"
                                  label="Title"
                                  :rules="[(v) => !!v || 'Title is required']"
                                  required
                                ></v-text-field>
                              </v-col>
                              <v-col cols="12">
                                <v-textarea
                                  v-model="item.description"
                                  label="Description"
                                  :rules="[
                                    (v) => !!v || 'Description is required',
                                  ]"
                                  required
                                ></v-textarea>
                              </v-col>
                              <v-col cols="12">
                                <v-text-field
                                  v-model="item.thumbnail"
                                  label="Thumbnail URL"
                                  required
                                ></v-text-field>
                              </v-col>
                              <v-col cols="12">
                                <v-text-field
                                  v-model="item.link"
                                  label="Link (optional)"
                                ></v-text-field>
                              </v-col>
                            </v-row>
                          </v-card-text>
                          <v-card-actions class="justify-end">
                            <v-btn
                              icon
                              color="red"
                              @click="removeItem(index)"
                              :disabled="feedItems.length === 1"
                            >
                              <v-icon>mdi-delete</v-icon>
                            </v-btn>
                          </v-card-actions>
                        </v-card>
                      </v-expansion-panel-text>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </v-col>

                <v-col cols="12" md="6">
                  <h3 class="mb-4">Settings</h3>
                  <v-slider
                    v-model.number="settings.scrollSpeed"
                    label="Scroll Speed"
                    :min="1"
                    :max="40"
                    :step="1"
                    :inverse-label="true"
                    ticks="always"
                    tick-size="2"
                    thumb-label="always"
                    thumb-size="24"
                    track-size="4"
                    class="mt-4"
                  ></v-slider>
                  <v-slider
                    v-model.number="settings.transparency"
                    label="Background Transparency"
                    :min="0"
                    :max="1"
                    :step="0.01"
                    ticks="always"
                    tick-size="2"
                    thumb-label="always"
                    thumb-size="24"
                    track-size="4"
                    class="mt-4"
                  ></v-slider>

                  <!-- New API Key Field -->
                  <v-text-field
                    v-model="apiKey"
                    label="Password"
                    type="password"
                    :rules="[(v) => !!v || 'API Key is required']"
                    required
                  ></v-text-field>
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
// Removed the useApi import as it's no longer needed

// Reactive state for feed items and loading status
const feedItems = ref([]);
const apiIsLoading = ref(false);
const isSaving = ref(false);

// Reactive state for settings
const settings = reactive({
  transparency: false,
  scrollSpeed: 30, // default scroll speed in seconds
});

// Reactive state for API Key (separate from settings)
const apiKey = ref("");

// Reactive state for settings dialog
const isSettingsDialogOpen = ref(false);
const isFormValid = ref(false);
const feedForm = ref(null);

// Function to fetch feed items from the API
const fetchFeedItems = async () => {
  apiIsLoading.value = true;
  try {
    const response = await fetch(
      "https://rev6ykipl5.execute-api.us-east-2.amazonaws.com/Prod/getData?key=ASSKBanner"
    );
    if (!response.ok) {
      throw new Error("Failed to fetch feed items.");
    }
    const data = await response.json();
    feedItems.value = data.feedItems;
    // Update settings using reactive assignment
    settings.transparency = data.settings.transparency;
    settings.scrollSpeed = data.settings.scrollSpeed;
  } catch (error) {
    console.error("Error fetching feed items:", error);
  } finally {
    apiIsLoading.value = false;
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
    link: "", // New optional link parameter
  });
};

const removeItem = (index) => {
  if (feedItems.value.length > 1) {
    feedItems.value.splice(index, 1);
  } else {
    alert("At least one feed item is required.");
  }
};

// Function to save settings and feed items
const saveSettings = async () => {
  if (!feedForm.value.validate()) {
    return;
  }

  if (!apiKey.value) {
    console.error("API Key is missing.");
    alert("API Key is required to save settings.");
    return;
  }

  isSaving.value = true;
  try {
    const payload = {
      feedItems: feedItems.value,
      settings: settings,
    };
    const response = await fetch(
      "https://rev6ykipl5.execute-api.us-east-2.amazonaws.com/Prod/getData?key=ASSKBanner",
      {
        method: "PUT",
        headers: {
          "X-Api-Key": apiKey.value,
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
    alert("Failed to save settings. Perhaps wrong password?");
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
  background: rgba(0, 0, 0, var(--transparency, 0.7));
  color: white;
  overflow: hidden;
  white-space: nowrap;
  transition: background 0.3s ease;
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
