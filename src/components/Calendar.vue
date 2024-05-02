<template>
  <v-card class="mx-auto my-10" elevation="2" rounded="lg">
    <v-toolbar color="primary" dark>
      <v-btn icon @click="showCalendar = !showCalendar">
        <v-icon>{{
          showCalendar ? "mdi-chevron-up" : "mdi-chevron-down"
        }}</v-icon>
      </v-btn>
      <v-toolbar-title>Calendar</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="toggleSort">
        <v-icon>mdi-sort-variant</v-icon>
      </v-btn>
    </v-toolbar>

    <v-progress-linear
      v-if="apiIsLoading"
      indeterminate
      class="mx-auto"
    ></v-progress-linear>

    <v-list v-show="showCalendar" class="h-[75vh] overflow-y-auto">
      <v-list-item-group>
        <v-list-item v-for="event in calendar" :key="event.id" class="group">
          <v-list-item-content>
            <v-list-item-title>{{ event.summary }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ formatDate(event.start) }} - {{ formatDate(event.end) }}
            </v-list-item-subtitle>
          </v-list-item-content>
          <template v-slot:append>
            <v-btn
              icon
              href="event.htmlLink"
              target="_blank"
              class="invisible group-hover:visible"
            >
              <v-icon>mdi-open-in-new</v-icon>
            </v-btn>
          </template>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useApi } from "@/useAPI.js";

const { setApiKey, getApiKey } = useApi();

const apiIsLoading = ref(false);
const calendar = ref([]);
const showCalendar = ref(true);

const fetchCalendar = async () => {
  apiIsLoading.value = true;
  const response = await fetch(
    "https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/getCal",
    {
      headers: {
        "X-Api-Key": getApiKey(),
      },
    }
  );
  const data = await response.json();
  calendar.value = data;
  apiIsLoading.value = false;
};

const formatDate = (dateObj) => {
  if (dateObj.dateTime) {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(new Date(dateObj.dateTime));
  }
  return `${new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateObj.date))} (All Day)`;
};

const toggleSort = () => {
  calendar.value.reverse();
};

onMounted(() => {
  fetchCalendar();
});
</script>

<style scoped>
.v-card {
  width: 100%;
}

.v-list-item-group {
  padding: 8px;
}

.v-list-item {
  border-bottom: 1px solid #ccc;
}
</style>
