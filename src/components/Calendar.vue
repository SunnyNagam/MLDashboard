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
        >
          <template v-slot:event="{ day, allDay, event }">
            <VChip
              :color="allDay ? 'primary' : undefined"
              density="compact"
              :label="allDay"
              width="100%"
              @click="showEvent(event)"
            >
              {{ event.title }}
            </VChip>
          </template>
        </v-calendar>
      </v-sheet>
    </div>

    <!-- Modal -->
    <v-dialog
      v-model="showEventDialog"
      max-width="500px"
      scroll-strategy="close"
    >
      <v-card>
        <v-card-title class="headline">{{ selectedEvent.title }}</v-card-title>
        <v-card-subtitle>
          Start: {{ selectedEvent.start }}
          <br />
          End: {{ selectedEvent.end }}
          <br />
          All Day: {{ selectedEvent.allDay ? "Yes" : "No" }}
          <br />
          <br />
          <VBtn :href="selectedEvent.link" target="_blank" :color="primary">
            <v-icon>mdi-calendar</v-icon>
            View Event</VBtn
          >
        </v-card-subtitle>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showEventDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useApi } from "@/useAPI.js";
import { VCalendar } from "vuetify/labs/VCalendar";
import { VBtn } from "vuetify/lib/components/index.mjs";

const { setApiKey, getApiKey } = useApi();

const apiIsLoading = ref(false);
const calendarEvents = ref([]);
const showCalendar = ref(true);
const currentDate = ref([new Date()]);
const viewType = ref("month");
const types = ref(["month", "week", "day"]);
const weekday = ref([0, 1, 2, 3, 4, 5, 6]);

// Modal Data
const showEventDialog = ref(false);
const selectedEvent = ref({});

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
  console.log(data[0]);
  calendarEvents.value = data.map((event) => ({
    title: event.summary,
    start: new Date(event.start.dateTime || event.start.date),
    end: new Date(event.end.dateTime || event.end.date),
    allDay: !event.start.dateTime,
    link: event.htmlLink,
  }));
  apiIsLoading.value = false;
};

onMounted(() => {
  fetchCalendar();
});

// Show Event in Modal
const showEvent = (event) => {
  selectedEvent.value = {
    title: event.title,
    start: event.start,
    end: event.start,
    allDay: event.allDay,
    link: event.link,
  };
  showEventDialog.value = true;
};
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
