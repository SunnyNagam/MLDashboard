<script setup>
import { ref } from "vue";
import { useApi } from "@/useAPI.js";

const { getApiKey } = useApi();

const getReddit = async () => {
  console.log(redditData.value);
  fetch("https://l49j2lk6oh.execute-api.us-east-2.amazonaws.com/Prod/fetch", {
    headers: {
      "X-Api-Key": getApiKey(),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      redditData.value = data;
      console.log(redditData.value);
      console.log(decodeHtml(redditData.value[0].posts[0].description));
      loading.value = false;
    })
    .catch((error) => console.log("Error fetching data:", error));
};
const loading = ref(true);
let redditData = ref({});

getReddit();
const decodeHtml = (html) => {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};
</script>

<template>
  <v-container class="mx-auto max-w-screen-md">
    <h1 class="text-4xl font-bold mb-4">
      <v-icon @click="console.log('hi :)')">mdi-reddit</v-icon>
      Daily Reddit Summary
    </h1>
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
                <div v-if="post.description" class="mb-4">
                  <v-card flat>
                    <v-card-text class="">
                      <div
                        class="md"
                        v-html="decodeHtml(post.description)"
                      ></div>
                    </v-card-text>
                  </v-card>
                </div>
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
