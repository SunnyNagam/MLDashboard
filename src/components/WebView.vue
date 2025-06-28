<template>
  <v-card :class="['mx-auto', isExpanded ? 'h-full d-flex flex-column' : '']" elevation="2" rounded="lg">
    <v-toolbar color="grey-darken-4" dark density="compact">
      <v-btn icon @click="toggleContent">
        <v-icon>{{ showContent ? "mdi-chevron-up" : "mdi-chevron-down" }}</v-icon>
      </v-btn>
      <v-toolbar-title>Web View</v-toolbar-title>
      <v-spacer></v-spacer>

      <!-- URL Display -->
      <v-chip v-if="webUrl" color="primary" text-color="white" size="small" class="mr-2">
        {{ urlDomain }}
      </v-chip>

      <!-- Settings Gear Icon -->
      <v-btn icon="mdi-cog" @click="showSettings = true" />
      <v-btn icon="mdi-refresh" @click="refreshWebView" />
      <v-btn icon="mdi-arrow-expand" @click="$emit('expand')" />
    </v-toolbar>

    <v-progress-linear v-if="loading" indeterminate class="mx-auto"></v-progress-linear>

    <v-card-text v-show="showContent" class="flex-grow-1 overflow-hidden px-0 py-0" :style="{ height: componentHeight + 'px' }">
      <!-- No URL configured -->
      <div v-if="!webUrl" class="d-flex align-center justify-center h-100 text-gray-500">
        <div class="text-center">
          <v-icon size="48" class="mb-2">mdi-web</v-icon>
          <div>Click the settings gear to configure a URL</div>
        </div>
      </div>

      <!-- Iframe error state -->
      <div v-else-if="showIframeError" class="d-flex align-center justify-center h-100 text-orange-500">
        <div class="text-center pa-4">
          <v-icon size="48" class="mb-2">mdi-alert-circle</v-icon>
          <div class="mb-2">This site cannot be embedded</div>
          <div class="text-sm text-gray-400 mb-4">{{ urlDomain }} blocks iframe embedding</div>
          <v-btn color="primary" :href="webUrl" target="_blank" prepend-icon="mdi-open-in-new"> Open in New Tab </v-btn>
        </div>
      </div>

      <!-- Iframe -->
      <div v-else class="iframe-container" :style="{ width: '100%', height: '100%', overflow: 'hidden' }">
        <iframe
          :src="webUrl"
          frameborder="0"
          :style="{
            width: Math.round(100 / zoomLevel) + '%',
            height: Math.round(100 / zoomLevel) + '%',
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top left',
            border: 'none',
          }"
          @load="handleIframeLoad"
          @error="handleIframeError"
          :sandbox="allowScripts ? 'allow-scripts allow-same-origin allow-forms allow-popups' : 'allow-same-origin'"
        ></iframe>
      </div>
    </v-card-text>
  </v-card>

  <!-- Settings Dialog -->
  <v-dialog v-model="showSettings" max-width="500">
    <v-card>
      <v-card-title class="headline">Web View Settings</v-card-title>
      <v-card-text>
        <v-text-field v-model="urlInput" label="Website URL" placeholder="https://example.com" prepend-icon="mdi-web" autofocus @keydown.enter="saveUrl" />
        <v-card-subtitle class="text-wrap px-0"> Enter the URL of the website you want to display. Make sure to include http:// or https:// </v-card-subtitle>

        <!-- Component Settings -->
        <v-divider class="my-4"></v-divider>
        <v-card-subtitle class="px-0 mb-2">Display Settings:</v-card-subtitle>

        <!-- Height Slider -->
        <div class="mb-4">
          <v-slider v-model="componentHeight" label="Height" min="200" max="800" step="50" show-ticks thumb-label prepend-icon="mdi-resize-vertical">
            <template v-slot:append>
              <span class="text-sm">{{ componentHeight }}px</span>
            </template>
          </v-slider>
        </div>

        <!-- Zoom Slider -->
        <div class="mb-4">
          <v-slider v-model="zoomLevel" label="Zoom Level" min="0.5" max="2" step="0.1" show-ticks thumb-label prepend-icon="mdi-magnify">
            <template v-slot:append>
              <span class="text-sm">{{ Math.round(zoomLevel * 100) }}%</span>
            </template>
          </v-slider>
          <v-card-subtitle class="px-0 text-sm">Zoom out (&lt;100%) shows more content, zoom in (&gt;100%) shows larger text</v-card-subtitle>
        </div>

        <!-- Auto Refresh -->
        <div class="mb-4">
          <v-select v-model="autoRefreshInterval" label="Auto Refresh" :items="refreshIntervals" prepend-icon="mdi-refresh" density="compact"></v-select>
        </div>

        <!-- Allow Scripts Toggle -->
        <div class="mb-4">
          <v-switch v-model="allowScripts" label="Allow JavaScript" color="primary" density="compact" hide-details></v-switch>
          <v-card-subtitle class="px-0 text-sm">Enable for interactive sites (less secure)</v-card-subtitle>
        </div>

        <!-- Quick URL Options -->
        <v-divider class="my-4"></v-divider>
        <div class="mt-4">
          <v-card-subtitle class="px-0">Quick Options:</v-card-subtitle>
          <v-chip-group>
            <v-chip v-for="quickUrl in quickUrls" :key="quickUrl.name" @click="urlInput = quickUrl.url" size="small">
              {{ quickUrl.name }}
            </v-chip>
          </v-chip-group>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn color="grey darken-4" @click="showSettings = false">Cancel</v-btn>
        <v-btn color="red darken-1" @click="clearUrl">Clear</v-btn>
        <v-btn color="primary" @click="saveUrl">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";

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

const showContent = ref(!props.collapsed);
const loading = ref(false);
const webUrl = ref("");
const urlInput = ref("");
const showSettings = ref(false);
const showIframeError = ref(false);

// Settings
const componentHeight = ref(400);
const zoomLevel = ref(1.0);
const autoRefreshInterval = ref(0);
const allowScripts = ref(false);

// Auto refresh intervals
const refreshIntervals = ref([
  { title: "No auto refresh", value: 0 },
  { title: "Every 30 seconds", value: 30 },
  { title: "Every minute", value: 60 },
  { title: "Every 5 minutes", value: 300 },
  { title: "Every 15 minutes", value: 900 },
]);

// Quick URL options for iframe-friendly sites
const quickUrls = ref([
  { name: "Wikipedia", url: "https://www.wikipedia.org" },
  { name: "OpenStreetMap", url: "https://www.openstreetmap.org" },
  { name: "Wolfram Alpha", url: "https://www.wolframalpha.com" },
  { name: "Archive.org", url: "https://archive.org" },
  { name: "MDN Docs", url: "https://developer.mozilla.org" },
  { name: "Can I Use", url: "https://caniuse.com" },
  { name: "CodePen", url: "https://codepen.io" },
  { name: "JSFiddle", url: "https://jsfiddle.net" },
]);

// Extract domain from URL for display
const urlDomain = computed(() => {
  if (!webUrl.value) return "";
  try {
    const url = new URL(webUrl.value);
    return url.hostname.replace("www.", "");
  } catch {
    return webUrl.value;
  }
});

function toggleContent() {
  showContent.value = !showContent.value;
}

function refreshWebView() {
  if (webUrl.value) {
    loading.value = true;
    showIframeError.value = false;

    // Clear any existing timeout
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }

    // Set a fallback timeout to stop loading after 10 seconds
    loadingTimeout = setTimeout(() => {
      loading.value = false;
      console.log("Loading timeout reached, stopping loading indicator");
    }, 3000);

    // Force iframe reload by changing src
    const currentUrl = webUrl.value;
    webUrl.value = "";
    setTimeout(() => {
      webUrl.value = currentUrl;
    }, 100);
  }
}

function handleIframeLoad() {
  loading.value = false;
  showIframeError.value = false;
  // Clear any existing timeout
  if (loadingTimeout) {
    clearTimeout(loadingTimeout);
    loadingTimeout = null;
  }
}

function saveUrl() {
  let url = urlInput.value.trim();

  if (!url) {
    showSettings.value = false;
    return;
  }

  // Add https:// if no protocol is specified
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  webUrl.value = url;
  saveSettings();
  showSettings.value = false;
  loading.value = true;
  showIframeError.value = false;

  // Clear any existing timeout
  if (loadingTimeout) {
    clearTimeout(loadingTimeout);
  }

  // Set a fallback timeout to stop loading after 10 seconds
  loadingTimeout = setTimeout(() => {
    loading.value = false;
    console.log("Loading timeout reached, stopping loading indicator");
  }, 3000);
}

function saveSettings() {
  const settings = {
    url: webUrl.value,
    height: componentHeight.value,
    zoom: zoomLevel.value,
    autoRefresh: autoRefreshInterval.value,
    allowScripts: allowScripts.value,
  };
  localStorage.setItem("webview-settings", JSON.stringify(settings));
}

function clearUrl() {
  webUrl.value = "";
  urlInput.value = "";
  localStorage.removeItem("webview-settings");
  // Reset to defaults
  componentHeight.value = 400;
  zoomLevel.value = 1.0;
  autoRefreshInterval.value = 0;
  allowScripts.value = false;
  showSettings.value = false;
  showIframeError.value = false;
}

function handleIframeError() {
  loading.value = false;
  showIframeError.value = true;
  console.error("Failed to load website in iframe - likely blocked by CSP or X-Frame-Options");
  // Clear any existing timeout
  if (loadingTimeout) {
    clearTimeout(loadingTimeout);
    loadingTimeout = null;
  }
}

// Auto refresh functionality
let autoRefreshTimer = null;
let loadingTimeout = null;

function setupAutoRefresh() {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer);
    autoRefreshTimer = null;
  }

  if (autoRefreshInterval.value > 0) {
    autoRefreshTimer = setInterval(() => {
      if (webUrl.value && !showIframeError.value) {
        refreshWebView();
      }
    }, autoRefreshInterval.value * 1000);
  }
}

// Load saved settings from localStorage on mount
onMounted(() => {
  const savedSettings = localStorage.getItem("webview-settings");
  if (savedSettings) {
    try {
      const settings = JSON.parse(savedSettings);
      webUrl.value = settings.url || "";
      urlInput.value = settings.url || "";
      componentHeight.value = settings.height || 400;
      zoomLevel.value = settings.zoom || 1.0;
      autoRefreshInterval.value = settings.autoRefresh || 0;
      allowScripts.value = settings.allowScripts || false;
    } catch (e) {
      console.error("Failed to parse saved webview settings:", e);
    }
  }

  setupAutoRefresh();
});

// Watch for settings dialog opening to sync input
watch(showSettings, (newVal) => {
  if (newVal) {
    urlInput.value = webUrl.value;
  }
});

// Watch for settings changes and save them
watch([componentHeight, zoomLevel, autoRefreshInterval, allowScripts], () => {
  if (webUrl.value) {
    saveSettings();
  }
  setupAutoRefresh();
});

// Cleanup on unmount
onUnmounted(() => {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer);
  }
  if (loadingTimeout) {
    clearTimeout(loadingTimeout);
  }
});

// Emit 'expand' event
defineEmits(["expand"]);
</script>

<style scoped>
iframe {
  border: none;
}

.iframe-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.iframe-container iframe {
  display: block;
  margin: 0;
  padding: 0;
}
</style>
