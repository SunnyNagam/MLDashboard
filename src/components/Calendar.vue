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
      <v-select
        v-model="viewType"
        :items="types"
        class="mr-2 w-12"
        variant="outlined"
        dense
        hide-details
      ></v-select>
    </v-toolbar>

    <v-progress-linear
      v-if="apiIsLoading"
      indeterminate
      class="mx-auto"
    ></v-progress-linear>

    <div v-show="showCalendar">
      <v-sheet class="text-lg">
        <v-calendar
          ref="calendar"
          v-model:now="currentDate"
          :events="calendarEvents"
          :view-mode="viewType"
          :weekdays="weekday"
          :hide-week-number="true"
        ></v-calendar>
      </v-sheet>
    </div>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useApi } from "@/useAPI.js";
import { VCalendar } from "vuetify/labs/VCalendar";

const { setApiKey, getApiKey } = useApi();

const apiIsLoading = ref(false);
const calendarEvents = ref([]);
const showCalendar = ref(true);
const currentDate = ref([new Date()]);
const viewType = ref("month");
const types = ref(["month", "week", "day"]);
const weekday = ref([0, 1, 2, 3, 4, 5, 6]);

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
  calendarEvents.value = data.map((event) => ({
    title: event.summary,
    start: new Date(event.start.dateTime || event.start.date),
    end: new Date(event.end.dateTime || event.end.date),
    allDay: !event.start.dateTime,
  }));
  apiIsLoading.value = false;
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
