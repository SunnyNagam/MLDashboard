<template>
  <div class="px-6 mt-4">
    <div class="flex flex-col items-center mb-4 text-center">
      <h1 class="text-h2 font-bold mb-2">
        <v-icon class="mr-2" @click="console.log('hi :)')">mdi-image</v-icon>
        Photo Gallery
      </h1>
      <h2 class="text-subtitle-1 mb-4">
        Search google photos with AI embeddings
      </h2>
    </div>
    <v-row>
      <v-col cols="10" sm="11">
        <v-text-field
          v-model="searchQuery"
          label="Enter search query"
          @keyup.enter="getPhotosClientSide"
        ></v-text-field>
      </v-col>
      <v-col cols="2" sm="1">
        <v-btn
          @click="getPhotosClientSide"
          icon="mdi-magnify"
          width="56px"
          height="56px"
        ></v-btn>
      </v-col>
    </v-row>
    <v-expansion-panels>
      <v-expansion-panel rounded="lg" class="mb-4">
        <v-expansion-panel-title>Search Options</v-expansion-panel-title>
        <v-expansion-panel-text class="bg-grey-100">
          <v-row>
            <v-col cols="12" sm="6">
              <v-btn @click="showApiKeyModal = true" variant="tonal"
                >Set API Key</v-btn
              >
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="6">
              <v-switch
                v-model="env.useBrowserCache"
                label="Enable Browser Cache"
                density="compact"
              ></v-switch>
            </v-col>
          </v-row>
          <v-row>
            <v-text-field
              v-model="topK"
              label="Number of Results"
              hide-details
              type="number"
              class="mb-4"
            ></v-text-field>
          </v-row>
          <v-row>
            <v-text-field
              v-model="filter.people"
              label="Filter by People"
              hide-details
            ></v-text-field>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
    <v-row>
      <v-col
        v-for="photo in photos"
        :key="photo.url"
        class="d-flex child-flex"
        :cols="12"
        :sm="6"
        :md="4"
        :lg="3"
        :xl="2"
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
import { ref, reactive, onMounted, watch } from "vue";
import Cookies from "vue-cookies";
import {
  AutoTokenizer,
  CLIPTextModelWithProjection,
  env as transformersEnv,
} from "@xenova/transformers";
import { Pinecone } from "@pinecone-database/pinecone";

transformersEnv.allowLocalModels = false;

const env = reactive({
  useBrowserCache: true,
});

async function loadModels() {
  processor = await AutoTokenizer.from_pretrained(
    "Xenova/clip-vit-base-patch16"
  );

  text_model = await CLIPTextModelWithProjection.from_pretrained(
    "Xenova/clip-vit-base-patch16"
  );
}

let processor, text_model;
await loadModels();

watch(
  () => env.useBrowserCache,
  async (newVal, oldVal) => {
    if (newVal !== oldVal) {
      await loadModels();
    }
  }
);
const searchQuery = ref("a group of friends enjoying the outdoors");
const photos = ref([]);
const loading = ref(false);
const imageHost =
  "https://res.cloudinary.com/dwjzkpvls/image/upload/v1715657866/";
const showApiKeyModal = ref(false);
const apiKey = ref("");
const topK = ref(5);
const filter = ref({});

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
  console.log("Filter: ", filter.value);
  const results = await index.query({
    vector: Array.from(embeddings),
    topK: Number(topK),
    includeValues: false,
    filter: filter.value,
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
