<template>
  <v-dialog v-model="dialogModel" max-width="500px">
    <v-card>
      <v-card-title class="headline">Completed Tasks History</v-card-title>
      <v-card-text>
        <v-date-picker
          v-model="selectedDate"
          class="mb-4"
          @update:model-value="updateDate"
        ></v-date-picker>
        <v-card outlined>
          <v-card-title class="text-h6">
            Tasks completed on
            {{ formattedDate }}:
          </v-card-title>
          <v-card-text>
            <v-list dense>
              <v-list-item
                v-for="(task, index) in historicalTasks"
                :key="index"
              >
                <template v-slot:prepend>
                  <v-icon color="success">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title>{{ task }}</v-list-item-title>
              </v-list-item>
              <v-list-item v-if="historicalTasks.length === 0">
                <v-list-item-title class="text-subtitle-1 font-italic">
                  No tasks completed on this day.
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey darken-1" text @click="close">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useApi } from "@/useAPI.js";
const { getApiKey } = useApi();

const props = defineProps({
  active: Boolean,
});

const emit = defineEmits(["update:active"]);

const dialogModel = computed({
  get: () => props.active,
  set: (value) => emit("update:active", value),
});

const selectedDate = ref(
  new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "America/Denver",
    })
  )
);
const BASE_URL = "https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod";
const historicalTasks = ref([]);

const formattedDate = computed(() => {
  return new Date(selectedDate.value).toLocaleDateString("en-US", {
    timeZone: "America/Denver",
  });
});

const updateDate = (newDate) => {
  fetchHistoricalTasks(newDate.toISOString().split("T")[0]);
};

const close = () => {
  dialogModel.value = false;
};

const fetchHistoricalTasks = async (date) => {
  console.log("Fetching historical tasks for date:", date);
  try {
    const response = await fetch(`${BASE_URL}/getHistoryTodo?date=${date}`, {
      headers: { "X-Api-Key": getApiKey() },
    });
    const data = await response.json();
    console.log("Historical tasks:", data);
    historicalTasks.value = data.tasks || [];
  } catch (error) {
    console.error("Error fetching historical tasks:", error);
  }
};

watch(dialogModel, (newValue) => {
  if (newValue) {
    fetchHistoricalTasks(selectedDate.value.toISOString().split("T")[0]);
  }
});
</script>
