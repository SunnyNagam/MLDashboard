<script setup>
import { ref, watch } from "vue";
import { useApi } from "@/useAPI.js";

const { getApiKey } = useApi();

const sortCriteria = ref("difficulty"); // Default sorting criteria
const sortOrder = ref("desc"); // Default sorting order

const getGoals = async () => {
  loading.value = true;
  fetch(
    `https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/fetchGoals`,
    {
      headers: {
        "X-Api-Key": getApiKey(),
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      goals.value = data;
      loading.value = false;
    })
    .catch((error) => console.log("Error fetching data:", error));
};

const goals = ref({});
const loading = ref(true);

getGoals();
/* example goal:
{
    "id": "e51c91a1-fb73-4d9a-aca4-23wedfsdf",
    "name": "Improve running speed",
    "description": "Running faster would help me get ready to run a half marathon",
    "status": "Idea",
    "difficulty": 1,
    "reward": 1,
    "createdAt": "2024-05-07T21:56:00.000Z"
}
*/

const sortGoals = () => {
  console.log("sorting goals");
  goals.value.sort((a, b) => {
    const order = sortOrder.value === "asc" ? 1 : -1;
    return order * (a[sortCriteria.value] - b[sortCriteria.value]);
  });
};

watch([sortCriteria, sortOrder], sortGoals);
</script>

<template>
  <v-container class="mx-auto max-w-screen-md">
    <div class="flex flex-col items-center mb-4">
      <h1 class="text-h2 font-bold mb-2">Goals</h1>
      <h2 class="text-subtitle-1 mb-4">Summary of your current Goals</h2>
      <v-row align="center" class="my-2">
        <v-select
          v-model="sortCriteria"
          :items="['difficulty', 'reward']"
          label="Sort by"
          dense
          outlined
          @change="sortGoals"
        ></v-select>
      </v-row>
    </div>
    <v-progress-linear
      v-if="loading"
      indeterminate
      class="mx-auto"
      size="64"
    ></v-progress-linear>
    <v-expansion-panels multiple popout>
      <v-expansion-panel
        v-for="(goal, index) in goals"
        :key="goal.id"
        class="mt-2"
      >
        <v-expansion-panel-title>
          <v-row no-gutters align="center">
            <v-icon left class="mr-2">mdi-pencil</v-icon>
            <span class="title font-semibold">{{ goal.name }}</span>
            <span
              v-if="goal.difficulty !== null"
              class="subtitle-2 ml-2"
              :class="{
                'text-red-500': goal.difficulty < 4,
                'text-yellow-500': goal.difficulty >= 4 && goal.difficulty < 7,
                'text-green-500': goal.difficulty >= 7,
              }"
            >
              Difficulty: {{ goal.difficulty }}
            </span>
            <span
              v-if="goal.reward !== null"
              class="subtitle-2 ml-2"
              :class="{
                'text-red-500': goal.reward < 4,
                'text-yellow-500': goal.reward >= 4 && goal.reward < 7,
                'text-green-500': goal.reward >= 7,
              }"
            >
              Reward: {{ goal.reward }}
            </span>
          </v-row>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-card>
            <v-card-text class="headline">
              {{ goal.description }}
            </v-card-text>
            <v-card-subtitle> Status: {{ goal.status }} </v-card-subtitle>
            <v-card-subtitle>
              Created At: {{ new Date(goal.createdAt).toLocaleString() }}
            </v-card-subtitle>
            <v-card-subtitle>
              Difficulty: {{ goal.difficulty }}
            </v-card-subtitle>
            <v-card-subtitle> Reward: {{ goal.reward }} </v-card-subtitle>
          </v-card>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>
