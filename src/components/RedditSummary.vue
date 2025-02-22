<script setup>
import { ref, watch } from "vue";
import { useApi } from "@/useAPI.js";

const { getApiKey } = useApi();
const imgRegex = /\.(jpg|jpeg|png|gif|bmp|webp|tiff|svg)(\?.*)?$/i;
const lastUpdated = ref(new Date());

const getReddit = async () => {
  loading.value = true;
  fetch(
    `https://l49j2lk6oh.execute-api.us-east-2.amazonaws.com/Prod/fetch?timeFrame=${selectedTimeframe.value}`,
    {
      headers: {
        "X-Api-Key": getApiKey(),
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      redditData.value = data;
      const updatedAt = new Date(data[0].updatedAt);
      const timeDiff = Math.abs(Date.now() - updatedAt.getTime());
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      if (days > 0) {
        lastUpdated.value = `${days} days ago`;
      } else {
        const hours = Math.floor(
          (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        lastUpdated.value = `${hours} hours ago`;
      }
      loading.value = false;
    })
    .catch((error) => console.log("Error fetching data:", error));
};

const decodeHtml = (html) => {
  // find all duplicate new lines (\n\n) and replace with <br>
  html = html.replace(/(\n\n)+/g, "<br>");

  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  let parsedHtml = txt.value;

  // replace images with img tags
  parsedHtml = parsedHtml.replace(
    /<a\s+href="([^"]+)">([^<]+)<\/a>/g,
    (match, href, text) => {
      if (imgRegex.test(href)) {
        return `<img src="${href}" alt="${text}">`;
      } else {
        return match; // leave non-image links unchanged
      }
    }
  );

  //console.log(parsedHtml);
  return parsedHtml;
};

const redditData = ref({});
const loading = ref(true);
const selectedTimeframe = ref("day");
const timeframes = ref([
  { title: "Daily", value: "day" },
  { title: "Weekly", value: "week" },
  { title: "Monthly", value: "month" },
]);

getReddit();

watch(selectedTimeframe, () => {
  getReddit(); // refetch data when selectedTimeframe changes
});
</script>

<template>
  <v-container class="mx-auto max-w-screen-md">
    <div class="flex flex-col items-center mb-4">
      <h1 class="text-h2 font-bold mb-2">
        <v-icon class="mr-2" @click="console.log('hi :)')">mdi-reddit</v-icon>
        Reddit Summary
      </h1>
      <h2 class="text-subtitle-1 mb-4">
        Summary of your favorite subreddit's top posts and comments
      </h2>
    </div>
    <div class="flex justify-center mb-4">
      <v-select
        v-model="selectedTimeframe"
        :items="timeframes"
        item-title="title"
        item-value="value"
        label=""
        outlined
        density="compact"
        variant="outlined"
        class="w-full md:w-1/2"
      ></v-select>
      <v-chip class="ml-4" color="primary" text-color="white">
        Updated: {{ lastUpdated }}
      </v-chip>
    </div>
    <v-progress-linear
      v-if="loading"
      indeterminate
      class="mx-auto"
      size="64"
    ></v-progress-linear>
    <v-expansion-panels multiple popout>
      <v-expansion-panel
        v-for="(subreddit, index) in redditData"
        :key="subreddit.subreddit"
        class="mt-4"
      >
        <v-expansion-panel-title>
          <v-row no-gutters align="center">
            <v-icon left class="mr-2">mdi-reddit</v-icon>
            <span class="title font-semibold">r/{{ subreddit.subreddit }}</span>
          </v-row>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-expansion-panels popout>
            <v-expansion-panel
              v-for="post in subreddit.posts"
              :key="post.permalink"
            >
              <v-expansion-panel-title class="title font-semibold">
                <v-btn
                  color=""
                  :href="'https://www.reddit.com' + post.permalink"
                  target="_blank"
                  class="mr-3"
                  size="x-small"
                  icon="mdi:mdi-share"
                />
                {{ post.title }}
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-card flat class="mb-4">
                  <v-card-text class="">
                    <div
                      v-if="post.description"
                      class="md"
                      v-html="decodeHtml(post.description)"
                    ></div>
                    <!-- if url is an image, render image instead -->
                    <img
                      v-else-if="post.url.match(imgRegex)"
                      :src="post.url"
                      alt="post image"
                      class="w-full"
                    />
                    <a v-else class="mb-4" :href="post.url">{{ post.url }}</a>
                  </v-card-text>
                </v-card>
                <div v-if="post.comments.length">
                  <div
                    v-for="(comment, cIndex) in post.comments"
                    :key="cIndex"
                    class="my-4"
                  >
                    <v-chip class="mr-2" color="" text-color="white">
                      u/{{ comment.author }}:
                    </v-chip>
                    <div class="md" v-html="decodeHtml(comment.body)"></div>
                  </div>
                </div>
                <div v-else class="text-gray-500">No comments</div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>
