<template>
  <v-card class="mx-auto" elevation="2" rounded="lg">
    <v-toolbar
      color="grey-darken-4"
      dark
      density="compact"
      :border="showCalendar ? 'md' : 'none'"
    >
      <v-btn icon @click="showCalendar = !showCalendar">
        <v-icon>{{
          showCalendar ? "mdi-chevron-up" : "mdi-chevron-down"
        }}</v-icon>
      </v-btn>
      <v-toolbar-title>Calendar</v-toolbar-title>
      <v-btn icon @click="addDialog = true">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <v-select
        v-model="viewType"
        :items="types"
        :items-title="types.title"
        :items-value="types.value"
        class="mr-2 w-1/12"
        variant="outlined"
        density="compact"
        hide-details
      ></v-select>
    </v-toolbar>

    <v-progress-linear
      v-if="apiIsLoading"
      indeterminate
      class="mx-auto"
    ></v-progress-linear>

    <div v-show="showCalendar">
      <v-sheet class="text-sm mx-0 mx-sm-4 pb-4">
        <v-calendar
          ref="calendar"
          v-model:now="currentDate"
          :events="calendarEvents"
          :view-mode="viewType"
          :weekdays="weekday"
          :hide-week-number="true"
        >
          <template v-slot:event="{ day, allDay, event }">
            <v-tooltip
              v-model="showTooltipId[event.id]"
              :text="
                event.title +
                ' (' +
                (allDay
                  ? 'All Day'
                  : event.start.toLocaleTimeString() +
                    ' - ' +
                    event.end.toLocaleTimeString()) +
                ')'
              "
              location="top center"
              :open-on-focus="true"
            >
              <template v-slot:activator="{ props }">
                <VChip
                  v-bind="props"
                  @touchstart="showTooltipId[event.id] = true"
                  @touchend="showTooltipId[event.id] = false"
                  @mouseenter="showTooltipId[event.id] = true"
                  @mouseleave="showTooltipId[event.id] = false"
                  :color="allDay ? 'primary' : undefined"
                  density="compact"
                  :label="allDay"
                  class="w-full"
                  @click="showEvent(event)"
                >
                  {{ event.title }}
                </VChip>
              </template>
            </v-tooltip>
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
        </v-card-subtitle>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn :href="selectedEvent.link" target="_blank" color="primary">
            <v-icon class="mr-1">mdi-calendar</v-icon>
            View On GCal
          </v-btn>
          <v-btn text @click="deleteEvent" color="red">
            <v-icon class="mr-1">mdi-delete</v-icon>
            Delete
          </v-btn>
          <v-btn text @click="showEventDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Event Modal -->
    <v-dialog v-model="addDialog" max-width="500px" scroll-strategy="close">
      <v-card>
        <v-card-title class="headline">Add an Event</v-card-title>
        <v-card-text>
          <v-form ref="addEventForm">
            <v-text-field
              v-model="newEvent.title"
              label="Event Title"
              required
            ></v-text-field>
            <v-row>
              <v-btn icon @click="menuStart = !menuStart">
                <v-icon>mdi-calendar</v-icon>
              </v-btn>
              <v-text-field
                v-model="newEvent.start"
                label="Start Time"
              ></v-text-field>
            </v-row>
            <v-date-picker
              v-model="newEvent.start"
              v-if="menuStart"
              @input="menuStart = false"
            ></v-date-picker>
            <v-row>
              <v-btn icon @click="menuEnd = !menuEnd">
                <v-icon>mdi-calendar</v-icon>
              </v-btn>
              <v-text-field
                v-model="newEvent.end"
                label="End Time"
              ></v-text-field>
            </v-row>
            <v-date-picker
              v-model="newEvent.end"
              v-if="menuEnd"
              @input="menuEnd = false"
            ></v-date-picker>
            <v-checkbox v-model="newEvent.allDay" label="All Day"></v-checkbox>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="grey darken-1" text @click="addDialog = false"
            >Close</v-btn
          >
          <v-btn color="primary" text @click="saveEvent">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, watch } from "vue";
import { useApi } from "@/useAPI.js";
import { VCalendar } from "vuetify/labs/VCalendar";
import { VBtn } from "vuetify/lib/components/index.mjs";

const { setApiKey, getApiKey } = useApi();

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
});

const apiIsLoading = ref(false);
const addDialog = ref(false);
const calendarEvents = ref([]);
const showCalendar = ref(true);
const currentDate = ref([new Date()]);
const viewType = ref("month");
const types = ref([
  { title: "Month", value: "month" },
  { title: "Week", value: "week" },
  { title: "Day", value: "day" },
]);
const weekday = ref([0, 1, 2, 3, 4, 5, 6]);

// Modal Data
const showEventDialog = ref(false);
const selectedEvent = ref({});
const showTooltipId = ref({});

// New Event Data
const newEvent = ref({
  title: "",
  start: new Date(),
  end: new Date(),
  allDay: false,
});
const menuStart = ref(false);
const menuEnd = ref(false);

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
  console.log(data);
  // Helper function to parse a local date string into a local Date object
  const parseGoogleDate = (dateString, isEnd = false) => {
    if (!dateString.includes("T")) {
      const dateParts = dateString.split("-");
      return new Date(
        parseInt(dateParts[0]), // year
        parseInt(dateParts[1]) - 1, // month (zero-based)
        parseInt(dateParts[2]) - (isEnd ? 1 : 0) // day (end dates are exclusive, so subtract 1 day)
      );
    }
    // If it's a datetime string, handle it as a standard date
    return new Date(dateString);
  };
  calendarEvents.value = data.map((event) => {
    return {
      id: event.id,
      title: event.summary,
      start: parseGoogleDate(event.start.dateTime || event.start.date),
      end: parseGoogleDate(event.end.dateTime || event.end.date, true),
      allDay: !event.start.dateTime,
      link: event.htmlLink,
    };
  });
  apiIsLoading.value = false;
};

if (props.collapsed) {
  showCalendar.value = false;
}

if (showCalendar.value) {
  fetchCalendar();
}

watch(
  () => showCalendar.value,
  (newValue) => {
    if (newValue) {
      fetchCalendar();
    }
  }
);

// watch the collapsed prop
watch(
  () => props.collapsed,
  (newValue) => {
    showCalendar.value = !newValue;
  }
);

// Date Formatting Utility
const formatDate = (date) => {
  return new Date(date).toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // This will use 12-hour format with AM/PM
  });
};

// Show Event in Modal
const showEvent = (event) => {
  selectedEvent.value = {
    id: event.id,
    title: event.title,
    start: formatDate(event.start),
    end: formatDate(event.end),
    allDay: event.allDay,
    link: event.link,
  };
  showEventDialog.value = true;
};

// Save New Event
const saveEvent = async () => {
  apiIsLoading.value = true;
  const event = {
    title: newEvent.value.title,
    start: new Date(newEvent.value.start).toISOString(),
    end: new Date(newEvent.value.end).toISOString(),
    allDay: newEvent.value.allDay,
  };

  if (event.allDay) {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    event.start = endDate.toISOString().split("T")[0];
    event.end = startDate.toISOString().split("T")[0];
  }

  const response = await fetch(
    `https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/addCal?title=${encodeURIComponent(
      event.title
    )}&start=${encodeURIComponent(event.start)}&end=${encodeURIComponent(
      event.end
    )}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": getApiKey(),
      },
    }
  );

  addDialog.value = false;
  menuEnd.value = false;
  menuStart.value = false;

  if (response.ok) {
    fetchCalendar();
  } else {
    console.error("Failed to save event");
    apiIsLoading.value = false;
  }
};

// Delete Event
const deleteEvent = async () => {
  apiIsLoading.value = true;
  const response = await fetch(
    `https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/deleteCal?id=${selectedEvent.value.id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": getApiKey(),
      },
    }
  );

  if (response.ok) {
    fetchCalendar();
    showEventDialog.value = false;
  } else {
    console.error("Failed to delete event");
    apiIsLoading.value = false;
  }
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
