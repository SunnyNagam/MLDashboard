<template>
  <v-card class="mx-auto" elevation="2" rounded="lg">
    <v-toolbar
      color="grey-darken-4"
      dark
      density="compact"
      :border="showList ? 'md' : 'none'"
    >
      <v-btn icon @click="showList = !showList">
        <v-icon>{{ showList ? "mdi-chevron-up" : "mdi-chevron-down" }}</v-icon>
      </v-btn>

      <v-toolbar-title>{{ title }}</v-toolbar-title>

      <v-spacer></v-spacer>
      <v-btn icon @click="addDialog = true">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <v-btn icon @click="toggleSelectionMode">
        <v-icon>mdi-checkbox-multiple-marked-outline</v-icon>
      </v-btn>
      <v-btn icon @click="openRandomItemDialog">
        <v-icon>mdi-dice-3</v-icon>
      </v-btn>
      <v-btn
        icon
        @click="removeItems"
        v-if="selectionMode && selectedItems.length > 0"
      >
        <v-icon color="red">mdi-delete</v-icon>
      </v-btn>
      <v-btn
        icon
        @click="deferItems"
        v-if="selectionMode && selectedItems.length > 0"
      >
        <v-icon>mdi-timer-outline</v-icon>
      </v-btn>
      <v-btn icon @click="openHistoryDialog">
        <v-icon>mdi-history</v-icon>
      </v-btn>
    </v-toolbar>
    <v-progress-linear
      v-if="apiIsLoading"
      indeterminate
      class="mx-auto"
      size="64"
    ></v-progress-linear>

    <v-list v-show="showList">
      <v-list-group v-for="item in todo" :key="item.id">
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            class="group"
            :style="getSwipeStyle(item.id)"
            v-touch:swipe.left="() => deferItem(item.id)"
            v-touch:swipe.right="() => removeItem(item.id)"
            @touchstart="(e) => startSwipe(item.id, e.touches[0].clientX)"
            @touchmove="(e) => updateSwipe(item.id, e.touches[0].clientX)"
            @touchend="() => endSwipe(item.id)"
          >
            <template v-slot:prepend>
              <v-checkbox
                v-if="selectionMode"
                v-model="selectedItems"
                :value="item.id"
                @click.stop
              ></v-checkbox>
              <v-icon v-else @click="toggleExpanded(item.id)">
                {{
                  isExpanded(item.id) ? "mdi-chevron-up" : "mdi-chevron-down"
                }}
              </v-icon>
            </template>
            <template v-slot:append> </template>
            <div class="flex flex-1" @click="handleItemClick(item)">
              <div class="flex-grow">
                <v-list-item-title>{{ item.text }}</v-list-item-title>
                <v-list-item-subtitle>
                  Created: {{ new Date(item.created).toDateString() }}
                </v-list-item-subtitle>
              </div>
              <div
                v-if="!selectionMode"
                class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center invisible group-hover:visible space-x-2 bg-zinc-800 p-2 rounded-lg"
              >
                <v-icon @click.stop="openAddDialog(item.id, null)">
                  mdi-table-row-plus-after
                </v-icon>
                <v-icon @click.stop="openAddDialog(null, item.id)">
                  mdi-plus
                </v-icon>
                <v-icon @click.stop="removeItem(item.id)" color="red">
                  mdi-delete
                </v-icon>
                <v-icon @click.stop="deferItem(item.id)">
                  mdi-timer-outline
                </v-icon>
              </div>
            </div>
          </v-list-item>
        </template>

        <v-list-item
          v-for="subTask in item.subTasks"
          :key="subTask.id"
          class="group"
          :style="getSwipeStyle(subTask.id)"
          @click="toggleEditing(subTask)"
          v-touch:swipe.left="() => deferItem(subTask.id)"
          v-touch:swipe.right="() => removeItem(subTask.id)"
          @touchstart="(e) => startSwipe(subTask.id, e.touches[0].clientX)"
          @touchmove="(e) => updateSwipe(subTask.id, e.touches[0].clientX)"
          @touchend="() => endSwipe(subTask.id)"
        >
          <template v-slot:prepend="{ isActive }">
            <v-list-item-action start>
              <v-checkbox-btn
                v-model="subTask.checked"
                @click="
                  toggleItem(
                    item.id,
                    subTask.id,
                    subTask.text,
                    !subTask.checked
                  )
                "
              ></v-checkbox-btn>
            </v-list-item-action>
          </template>
          <v-list-item-title>{{ subTask.text }}</v-list-item-title>
          <template v-slot:append>
            <div
              class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center invisible group-hover:visible space-x-2 bg-zinc-800 p-2 rounded-lg"
            >
              <v-icon @click.stop="openAddDialog(subTask.id, item.id)">
                mdi-table-row-plus-after
              </v-icon>
              <v-icon @click.stop="removeItem(subTask.id)" color="red">
                mdi-delete
              </v-icon>
            </div>
          </template>
        </v-list-item>
      </v-list-group>
    </v-list>

    <TodoEditDialog
      :active="editDialog"
      :item="editDialogItem"
      @save="saveEdit"
      @toggle="editDialog = $event"
    ></TodoEditDialog>

    <TodoAddDialog v-model:active="addDialog" @save="addItem"></TodoAddDialog>

    <v-dialog v-model="randomItemDialog" max-width="500px">
      <v-card v-if="randomItem">
        <v-card-title class="headline">Random Todo Item</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="randomItem.text"
            label="Item text"
            @keyup.enter="saveRandomItemEdit"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="drawRandomItem">Draw Another</v-btn>
          <v-btn color="success" @click="saveRandomItemEdit">Save</v-btn>
          <v-btn color="error" @click="deleteRandomItem">Delete</v-btn>
          <v-btn color="warning" @click="deferRandomItem">Defer</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="randomItemDialog = false"
            >Close</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="historyDialog" max-width="500px">
      <v-card>
        <v-card-title class="headline">Completed Tasks History</v-card-title>
        <v-card-text>
          <v-date-picker v-model="selectedDate" class="mb-4"></v-date-picker>
          <v-card outlined>
            <v-card-title class="text-h6">
              Tasks completed on
              {{
                new Date(selectedDate).toLocaleDateString("en-US", {
                  timeZone: "America/Denver",
                })
              }}:
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
                  <v-list-item-title class="text-subtitle-1 font-italic"
                    >No tasks completed on this day.</v-list-item-title
                  >
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="historyDialog = false"
            >Close</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import TodoEditDialog from "./TodoEditDialog.vue";
import TodoAddDialog from "./TodoAddDialog.vue";
import { useApi } from "@/useAPI.js";

const { setApiKey, getApiKey } = useApi();

const props = defineProps({
  title: {
    type: String,
    default: "Now",
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
});

const todo = ref([{ text: "Loading...", id: "..." }]);
const apiIsLoading = ref(false);
const showList = ref(!props.collapsed);
const addDialog = ref(false);
const editDialog = ref(false);
const editDialogItem = ref({});
const randomItemDialog = ref(false);
const randomItem = ref(null);
const historyDialog = ref(false);
const historicalTasks = ref([]);
const selectedDate = ref(
  new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "America/Denver",
    })
  )
);

const BASE_URL = "https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod";

// Simplified API calls
const apiCall = async (endpoint, method = "GET", body = null) => {
  apiIsLoading.value = true;
  try {
    const response = await fetch(endpoint, {
      method,
      headers: { "X-Api-Key": getApiKey() },
      body: body ? JSON.stringify(body) : null,
    });
    return await response.json();
  } finally {
    apiIsLoading.value = false;
  }
};

// Simplified CRUD operations
const fetchTodo = () =>
  apiCall(`${BASE_URL}/fetch?list_name=${props.title}`).then(
    (data) => (todo.value = data[props.title])
  );

const addItem = async (text, afterId = null, parentId = null) => {
  addDialog.value = false;
  addAfterID.value = null;
  addParentID.value = null;
  let endpoint = `${BASE_URL}/add?text=${text}`;
  if (afterId) endpoint += `&after_id=${afterId}`;
  if (parentId) endpoint += `&parent_id=${parentId}`;

  const data = await apiCall(endpoint);
  updateLocalStateAfterAdd(text, data.results[0].id, afterId, parentId);
};

const editItem = async (text, id, checked) => {
  let endpoint = `${BASE_URL}/edit?text=${text}&block_id=${id}`;
  if (checked !== undefined) endpoint += `&todoToggle=${checked}`;

  await apiCall(endpoint);
  updateLocalStateAfterEdit({ id, text, checked });
};

const removeItem = async (id) => {
  await apiCall(`${BASE_URL}/delete?block_id=${id}`);
  updateLocalStateAfterRemoval([id]);
};

const deferItem = async (id) => {
  const deferParam = props.title === "Now" ? "defer=true" : "deferWeek=true";
  await apiCall(`${BASE_URL}/delete?block_id=${id}&${deferParam}`);
  updateLocalStateAfterRemoval([id]);
};

// Batch operations
const batchOperation = async (operation, ids) => {
  if (ids.length === 0) return;
  const idsString = ids.join(",");
  const endpoint = `${BASE_URL}/delete?block_id=${idsString}${
    operation === "defer"
      ? `&${props.title === "Now" ? "defer=true" : "deferWeek=true"}`
      : ""
  }`;
  await apiCall(endpoint);
  updateLocalStateAfterRemoval(ids);
  selectedItems.value = [];
  selectionMode.value = false;
};

const removeItems = () => batchOperation("remove", selectedItems.value);
const deferItems = () => batchOperation("defer", selectedItems.value);

// Local state update functions
const updateLocalStateAfterAdd = (text, id, afterId, parentId) => {
  const newItem = {
    text,
    id,
    created: new Date().toISOString(),
    checked: false,
    subTasks: [],
  };
  if (!parentId) {
    const index = afterId
      ? todo.value.findIndex((item) => item.id === afterId)
      : -1;
    todo.value.splice(index + 1, 0, newItem);
  } else {
    todo.value = todo.value.map((item) => {
      if (item.id === parentId) {
        const subIndex = item.subTasks.findIndex(
          (subTask) => subTask.id === afterId
        );
        item.subTasks.splice(subIndex + 1, 0, newItem);
      }
      return item;
    });
  }
};

const updateLocalStateAfterEdit = (editedItem) => {
  todo.value = todo.value.map((item) => {
    if (item.id === editedItem.id) return { ...item, ...editedItem };
    if (item.subTasks) {
      return {
        ...item,
        subTasks: item.subTasks.map((subTask) =>
          subTask.id === editedItem.id ? { ...subTask, ...editedItem } : subTask
        ),
      };
    }
    return item;
  });
};

const updateLocalStateAfterRemoval = (idsToRemove) => {
  todo.value = todo.value
    .filter((item) => !idsToRemove.includes(item.id))
    .map((item) => ({
      ...item,
      subTasks: item.subTasks
        ? item.subTasks.filter((subTask) => !idsToRemove.includes(subTask.id))
        : [],
    }));
};

const expandedItems = ref({});
const toggleExpanded = (itemId) => {
  if (expandedItems.value[itemId]) {
    delete expandedItems.value[itemId];
  } else {
    expandedItems.value[itemId] = true;
  }
};

const isExpanded = computed(() => (itemId) => !!expandedItems.value[itemId]);

const selectionMode = ref(false);
const selectedItems = ref([]);

const toggleSelectionMode = () => {
  selectionMode.value = !selectionMode.value;
  if (!selectionMode.value) {
    selectedItems.value = [];
  }
};

const newItemText = ref("");
const addAfterID = ref(null);
const addParentID = ref(null);
const toggleEditing = (item) => {
  if (item) {
    editDialogItem.value = item;
    editDialog.value = true;
  }
};

const saveEdit = async (text, id, item) => {
  editDialog.value = false;
  await editItem(text, id, item.checked);
};

const swipeState = ref({});
const swipeStartX = ref({});
const swipeProgress = ref({});

const startSwipe = (itemId, clientX) => {
  swipeStartX.value[itemId] = clientX;
  swipeState.value[itemId] = null;
  swipeProgress.value[itemId] = 0;
};

const updateSwipe = (itemId, clientX) => {
  if (swipeStartX.value[itemId] !== undefined) {
    const diff = clientX - swipeStartX.value[itemId];
    const screenWidth = window.innerWidth;
    const maxSwipeDistance = screenWidth * 0.3; // 30% of screen width
    swipeProgress.value[itemId] = Math.min(
      Math.abs(diff) / maxSwipeDistance,
      1
    );

    if (Math.abs(diff) > screenWidth * 0.05) {
      swipeState.value[itemId] = diff < 0 ? "left" : "right";
    } else {
      swipeState.value[itemId] = "none";
    }
  }
};

const getSwipeStyle = (itemId) => {
  const progress = swipeProgress.value[itemId] || 0;
  const state = swipeState.value[itemId];

  if (state === "left") {
    // Radial gradient
    return {
      background: `radial-gradient(circle at right, rgba(236, 203, 58, ${
        progress * 0.7
      }), transparent)`,
    };
  } else if (state === "right") {
    // Conic gradient
    return {
      background: `radial-gradient(circle at left, rgba(255, 0, 0, ${
        progress * 0.7
      }), transparent)`,
    };
  }
  return {};
};

const endSwipe = (itemId) => {
  delete swipeState.value[itemId];
  delete swipeStartX.value[itemId];
  delete swipeProgress.value[itemId];
};

const handleItemClick = (item) => {
  if (!selectionMode.value) {
    toggleEditing(item);
  } else {
    const index = selectedItems.value.indexOf(item.id);
    if (index > -1) {
      selectedItems.value.splice(index, 1);
    } else {
      selectedItems.value.push(item.id);
    }
  }
};

const openAddDialog = (afterID, parentID) => {
  addDialog.value = true;
  addAfterID.value = afterID;
  addParentID.value = parentID;
};

const openRandomItemDialog = () => {
  drawRandomItem();
  randomItemDialog.value = true;
};

const drawRandomItem = () => {
  const allItems = todo.value.flatMap((item) => [item]);
  console.log(allItems.map((item) => item.text));
  if (allItems.length > 0) {
    const randomIndex = Math.floor(Math.random() * allItems.length);
    randomItem.value = allItems[randomIndex];
  } else {
    randomItem.value = null;
  }
};

const deleteRandomItem = async () => {
  if (randomItem.value) {
    await removeItem(randomItem.value.id);
    drawRandomItem();
  }
};

const deferRandomItem = async () => {
  if (randomItem.value) {
    await deferItem(randomItem.value.id);
    drawRandomItem();
  }
};

const saveRandomItemEdit = async () => {
  if (randomItem.value) {
    await editItem(
      randomItem.value.text,
      randomItem.value.id,
      randomItem.value.checked
    );
    // Update the local state
    updateLocalStateAfterEdit(randomItem.value);
  }
};

const fetchHistoricalTasks = async (date) => {
  try {
    const response = await fetch(`${BASE_URL}/getHistoryTodo?date=${date}`, {
      headers: { "X-Api-Key": getApiKey() },
    });
    const data = await response.json();
    historicalTasks.value = data.tasks || [];
  } catch (error) {
    console.error("Error fetching historical tasks:", error);
  }
};

const openHistoryDialog = () => {
  const localDate = new Date(
    selectedDate.value.toLocaleString("en-US", { timeZone: "America/Denver" })
  );
  const formattedDate = `${localDate.getFullYear()}-${String(
    localDate.getMonth() + 1
  ).padStart(2, "0")}-${String(localDate.getDate()).padStart(2, "0")}`;
  fetchHistoricalTasks(formattedDate);
  historyDialog.value = true;
};

watch(selectedDate, (newDate) => {
  fetchHistoricalTasks(newDate.toISOString().split("T")[0]);
});

// Watchers and lifecycle hooks
watch(
  () => showList.value,
  (newValue) => {
    if (newValue) fetchTodo();
  }
);

if (showList.value) fetchTodo();
</script>

<style scoped>
.v-list-item {
  transition: background 0.1s ease;
}
</style>
