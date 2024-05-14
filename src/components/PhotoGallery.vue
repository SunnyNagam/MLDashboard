<template>
  <div class="px-6">
    <h1>Photo Gallery</h1>
    <v-text-field
      v-model="searchQuery"
      label="Enter search query"
    ></v-text-field>
    <v-row>
      <v-col cols="12" sm="6">
        <v-btn @click="getPhotosClientSide">Search</v-btn>
        <v-btn @click="showApiKeyModal = true" class="ml-2">Set API Key</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="6">
        <v-switch
          v-model="env.useBrowserCache"
          label="Enable Browser Cache"
          density="compact"
        ></v-switch>
        <v-text-field
          v-model="topK"
          label="Number of Results"
          hide-details
          type="number"
        ></v-text-field>
      </v-col>
    </v-row>

    <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
    <v-row>
      <v-col
        v-for="photo in photos"
        :key="photo.url"
        class="d-flex child-flex"
        cols="4"
      >
        <v-img
          :src="`${imageHost}${photo.url}`"
          aspect-ratio="1"
          class="bg-grey-lighten-2"
          cover
        >
          <template v-slot:placeholder>
            <v-row align="center" class="fill-height ma-0" justify="center">
              <v-progress-circular
                color="grey-lighten-5"
                indeterminate
              ></v-progress-circular>
            </v-row>
          </template>
        </v-img>
      </v-col>
    </v-row>

    <v-dialog v-model="showApiKeyModal" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Set Pinecone API Key</span>
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="apiKey"
            label="Pinecone API Key"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="saveApiKey">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Cookies from "vue-cookies";
import {
  AutoTokenizer,
  CLIPTextModelWithProjection,
  env,
} from "@xenova/transformers";
import { Pinecone } from "@pinecone-database/pinecone";

env.allowLocalModels = false;
env.useBrowserCache = true;

const processor = await AutoTokenizer.from_pretrained(
  "Xenova/clip-vit-base-patch16"
);

const text_model = await CLIPTextModelWithProjection.from_pretrained(
  "Xenova/clip-vit-base-patch16"
);

const searchQuery = ref("nature");
const photos = ref([]);
const loading = ref(false);
const imageHost =
  "https://res.cloudinary.com/dwjzkpvls/image/upload/v1715657866/";
const showApiKeyModal = ref(false);
const apiKey = ref("");
const topK = ref(5);

const getPhotosClientSide = async () => {
  loading.value = true;
  const embeddings = await processString(searchQuery.value);
  console.log("Embeddings: ", embeddings);
  const results = await searchPinecone(searchQuery.value, topK.value);
  console.log("Results: ", results);
  photos.value = results.matches.map((match) => ({
    url: match.id,
    alt: match.id,
    title: `${match.id} (${Math.round(match.score * 100000) / 100000})`,
  }));
  loading.value = false;
};

async function searchPinecone(query, topK) {
  const pc = new Pinecone({ apiKey: apiKey.value });
  const embeddings = await processString(query);
  console.log("Embeddings: ", embeddings);

  const index = pc.index("photo-search");

  const results = await index.query({
    vector: Array.from(embeddings),
    topK: Number(topK),
    includeValues: false,
  });
  return results;
}

async function processString(string) {
  console.log("Processing string: ", string);

  const texts = [string];
  const text_inputs = await processor(texts, {
    padding: true,
    truncation: true,
  });

  const { text_embeds } = await text_model(text_inputs);
  return text_embeds.data;
}

function saveApiKey() {
  Cookies.set("pineconeApiKey", apiKey.value);
  showApiKeyModal.value = false;
}

onMounted(() => {
  const savedApiKey = Cookies.get("pineconeApiKey");
  if (savedApiKey) {
    apiKey.value = savedApiKey;
  }
});
</script>
