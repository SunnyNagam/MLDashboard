<template>
  <v-card :class="['mx-auto', isExpanded ? 'h-full d-flex flex-column' : '']" elevation="2" rounded="lg">
    <v-toolbar color="grey-darken-4" dark density="compact">
      <v-btn icon @click="toggleContent">
        <v-icon>{{ showContent ? "mdi-chevron-up" : "mdi-chevron-down" }}</v-icon>
      </v-btn>
      <v-toolbar-title>Reddit</v-toolbar-title>
      <v-spacer></v-spacer>

      <!-- Timeframe Selector -->
      <v-select
        v-model="selectedTimeframe"
        :items="timeframes"
        bg-color="none"
        item-title="title"
        item-value="value"
        dense
        hide-details
        style="max-width: 120px"
      ></v-select>

      <!-- Subreddit Selector -->
      <v-select
        v-model="selectedSubreddit"
        :items="subreddits"
        item-title="title"
        item-value="value"
        dense
        hide-details
        style="max-width: 150px; margin-left: 8px"
        bg-color="none"
      ></v-select>

      <v-btn icon="mdi-refresh" @click="getReddit" />
      <v-btn icon="mdi-arrow-expand" @click="$emit('expand')" />
    </v-toolbar>

    <v-progress-linear v-if="loading" indeterminate class="mx-auto"></v-progress-linear>

    <v-card-text v-show="showContent" class="flex-grow-1 overflow-y-auto px-0">
      <div v-if="selectedSubredditData" class="">
        <v-expansion-panels popout>
          <v-expansion-panel v-for="post in selectedSubredditData.posts" :key="post.permalink">
            <v-expansion-panel-title class="title font-semibold">
              <v-btn :href="'https://www.reddit.com' + post.permalink" target="_blank" class="mr-3" size="x-small" icon="mdi-share"></v-btn>
              {{ post.title }}
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-card flat class="mb-4">
                <v-card-text>
                  <div v-if="post.description" class="md" v-html="decodeHtml(post.description)"></div>
                  <!-- Render image if URL is an image -->
                  <img v-else-if="imgRegex.test(post.url)" :src="post.url" alt="post image" class="w-full" />
                  <a v-else :href="post.url">{{ post.url }}</a>
                </v-card-text>
              </v-card>
              <div v-if="post.comments.length">
                <div v-for="(comment, cIndex) in post.comments" :key="cIndex" class="my-4">
                  <v-chip class="mr-2" color="primary" text-color="white"> u/{{ comment.author }}: </v-chip>
                  <div class="md" v-html="decodeHtml(comment.body)"></div>
                </div>
              </div>
              <div v-else class="text-gray-500">No comments</div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
      <div v-else-if="!selectedSubreddit" class="text-gray-500 mt-4 pl-4">No subreddit selected</div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { useApi } from "@/useAPI.js";

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

const showContent = ref(!props.collapsed);
const loading = ref(false);
const redditData = ref([]);
const imgRegex = /\.(jpg|jpeg|png|gif|bmp|webp|tiff|svg)(\?.*)?$/i;

const selectedTimeframe = ref("day");
const timeframes = ref([
  { title: "Daily", value: "day" },
  { title: "Weekly", value: "week" },
  { title: "Monthly", value: "month" },
]);

const selectedSubreddit = ref("calgary");
const subreddits = ref([]);

function toggleContent() {
  showContent.value = !showContent.value;
  if (showContent.value && redditData.value.length === 0) {
    getReddit();
  }
}

function decodeHtml(html) {
  html = html.replace(/(\n\n)+/g, "<br>");

  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  let parsedHtml = txt.value;

  // Replace image links with img tags
  parsedHtml = parsedHtml.replace(/<a\s+href="([^"]+)">([^<]+)<\/a>/g, (match, href, text) => {
    if (imgRegex.test(href)) {
      return `<img src="${href}" alt="${text}">`;
    } else {
      return match; // Leave non-image links unchanged
    }
  });

  return parsedHtml;
}

async function getReddit() {
  loading.value = true;
  try {
    const response = await fetch(`https://l49j2lk6oh.execute-api.us-east-2.amazonaws.com/Prod/fetch?timeFrame=${selectedTimeframe.value}`, {
      headers: {
        "X-Api-Key": getApiKey(),
      },
    });
    const data = await response.json();
    redditData.value = data;

    // Populate the list of subreddits
    subreddits.value = data.map((subreddit) => ({
      title: `r/${subreddit.subreddit}`,
      value: subreddit.subreddit,
    }));

    // If no subreddit is selected, select the first one
    if (!selectedSubreddit.value && subreddits.value.length > 0) {
      selectedSubreddit.value = subreddits.value[1].value;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    loading.value = false;
  }
}

const selectedSubredditData = computed(() => {
  console.log(redditData);
  return redditData.value.find((subreddit) => subreddit.subreddit === selectedSubreddit.value) || null;
});

watch([selectedTimeframe], () => {
  getReddit(); // Refetch data when selectedTimeframe changes
});

onMounted(() => {
  if (showContent.value) {
    getReddit();
  }
});

// Emit 'expand' event
defineEmits(["expand"]);
</script>

<style scoped>
.md img {
  max-width: 100%;
  height: auto;
}
</style>
