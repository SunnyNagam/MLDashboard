<template>
  <v-card class="mx-auto" elevation="2" rounded="lg">
    <!-- Toolbar -->
    <v-toolbar
      color="grey-darken-4"
      dark
      dense
      :border="showList ? 'md' : 'none'"
    >
      <v-btn icon @click="showList = !showList">
        <v-icon>{{ showList ? "mdi-chevron-up" : "mdi-chevron-down" }}</v-icon>
      </v-btn>

      <v-toolbar-title>{{ title }}</v-toolbar-title>

      <v-spacer></v-spacer>

      <!-- Dynamic Toolbar Buttons -->
      <template v-for="button in toolbarButtons" :key="button.icon">
        <v-btn v-if="button && button.visible" icon @click="button.action">
          <v-icon :color="button.color">{{ button.icon }}</v-icon>
        </v-btn>
      </template>
    </v-toolbar>

    <!-- Progress Bar -->
    <v-progress-linear
      v-if="apiIsLoading"
      indeterminate
      class="mx-auto"
      size="64"
    ></v-progress-linear>

    <!-- Todo List -->
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
                  Created: {{ formatDate(item.created) }}
                </v-list-item-subtitle>
              </div>

              <div
                v-if="!selectionMode"
                class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2 bg-zinc-800 p-2 rounded-lg invisible group-hover:visible"
              >
                <v-icon @click.stop="openAddDialog(item.id, null)"
                  >mdi-table-row-plus-after</v-icon
                >
                <v-icon @click.stop="openAddDialog(null, item.id)"
                  >mdi-plus</v-icon
                >
                <v-icon @click.stop="removeItem(item.id)" color="red"
                  >mdi-delete</v-icon
                >
                <v-icon @click.stop="deferItem(item.id)"
                  >mdi-timer-outline</v-icon
                >
              </div>
            </div>
          </v-list-item>
        </template>

        <!-- Subtasks -->
        <v-list-item
          v-for="subTask in item.subTasks"
          :key="subTask.id"
          class="group"
          :style="getSwipeStyle(subTask.id)"
          v-touch:swipe.left="() => deferItem(subTask.id)"
          v-touch:swipe.right="() => removeItem(subTask.id)"
          @touchstart="(e) => startSwipe(subTask.id, e.touches[0].clientX)"
          @touchmove="(e) => updateSwipe(subTask.id, e.touches[0].clientX)"
          @touchend="() => endSwipe(subTask.id)"
          @click="toggleEditing(subTask)"
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
              class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2 bg-zinc-800 p-2 rounded-lg invisible group-hover:visible"
            >
              <v-icon @click.stop="openAddDialog(subTask.id, item.id)"
                >mdi-table-row-plus-after</v-icon
              >
              <v-icon @click.stop="removeItem(subTask.id)" color="red"
                >mdi-delete</v-icon
              >
            </div>
          </template>
        </v-list-item>
      </v-list-group>
    </v-list>

    <!-- Dialogs -->
    <TodoEditDialog
      :active="editDialog"
      :item="editDialogItem"
      @save="editItem"
      @toggle="editDialog = $event"
    ></TodoEditDialog>

    <TodoAddDialog v-model:active="addDialog" @save="addItem"></TodoAddDialog>

    <RandomItemDialog
      v-model:active="randomItemDialog"
      :item="randomItem"
      @save="editItem"
      @delete="removeItem"
      @defer="deferItem"
      @drawAnother="drawRandomItem"
    ></RandomItemDialog>

    <HistoryDialog v-model:active="historyDialog"></HistoryDialog>
  </v-card>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import TodoEditDialog from "./TodoEditDialog.vue";
import TodoAddDialog from "./TodoAddDialog.vue";
import RandomItemDialog from "./RandomItemDialog.vue";
import HistoryDialog from "./HistoryDialog.vue";
import { useApi } from "@/useAPI.js";
import { useSwipe } from "./useSwipe"; // Import the composable

const { getApiKey } = useApi();

// Props
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

// Reactive State
const todo = ref([{ text: "Loading...", id: "..." }]);
const emit = defineEmits(["expand"]);
const apiIsLoading = ref(false);
const showList = ref(!props.collapsed);
const addAfterID = ref(null);
const addParentID = ref(null);
const addDialog = ref(false);
const editDialog = ref(false);
const editDialogItem = ref({});
const randomItemDialog = ref(false);
const randomItem = ref(null);
const historyDialog = ref(false);
const selectionMode = ref(false);
const selectedItems = ref([]);

// Swipe Handling
const { startSwipe, updateSwipe, endSwipe, getSwipeStyle } = useSwipe();

// Expanded Items
const expandedItems = ref({});

// Computed Properties
const isExpanded = computed(() => (itemId) => !!expandedItems.value[itemId]);

// Toolbar Buttons Configuration
const toolbarButtons = computed(() => [
  {
    icon: "mdi-plus",
    action: () => (addDialog.value = true),
    visible: true,
  },
  {
    icon: "mdi-checkbox-multiple-marked-outline",
    action: toggleSelectionMode,
    visible: true,
  },
  {
    icon: "mdi-dice-3",
    action: handleRandomItem,
    visible: true,
  },
  {
    icon: "mdi-delete",
    action: removeItems,
    color: "red",
    visible: selectionMode.value && selectedItems.value.length > 0,
  },
  {
    icon: "mdi-timer-outline",
    action: deferItems,
    visible: selectionMode.value && selectedItems.value.length > 0,
  },
  {
    icon: "mdi-history",
    action: () => (historyDialog.value = true),
    visible: true,
  },
  {
    icon: "mdi-arrow-expand",
    action: () => emit("expand"),
    visible: true,
  },
]);

// API Base URL
const BASE_URL = "https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod";

// API Call Helper
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

// Fetch Todo Items
const fetchTodo = async () => {
  const data = await apiCall(
    `${BASE_URL}/fetch?list_name=${encodeURIComponent(props.title)}`
  );
  todo.value = data?.[props.title] || [];
};

// Add Item
const addItem = async (text, afterId = null, parentId = null) => {
  addDialog.value = false;
  addAfterID.value = null;
  addParentID.value = null;
  const params = new URLSearchParams({ text });
  if (afterId) params.append("after_id", afterId);
  if (parentId) params.append("parent_id", parentId);

  const data = await apiCall(`${BASE_URL}/add?${params.toString()}`);
  if (data?.results?.[0]?.id) {
    updateLocalStateAfterAdd(text, data.results[0].id, afterId, parentId);
  }
};

// Edit Item
const editItem = async (text, id, checked) => {
  editDialog.value = false;
  const params = new URLSearchParams({ text, block_id: id });
  if (checked !== undefined) params.append("todoToggle", checked);

  const response = await apiCall(`${BASE_URL}/edit?${params.toString()}`);
  if (response) {
    updateLocalStateAfterEdit({ id, text, checked });
  }
};

// Remove Item
const removeItem = async (id) => {
  const response = await apiCall(`${BASE_URL}/delete?block_id=${id}`);
  if (response) {
    updateLocalStateAfterRemoval([id]);
  }
};

// Defer Item
const deferItem = async (id) => {
  const deferParam = props.title === "Now" ? "defer=true" : "deferWeek=true";
  const response = await apiCall(
    `${BASE_URL}/delete?block_id=${id}&${deferParam}`
  );
  if (response) {
    updateLocalStateAfterRemoval([id]);
  }
};

// Batch Operations
const batchOperation = async (operation, ids) => {
  if (!ids.length) return;
  const params = new URLSearchParams({ block_id: ids.join(",") });
  if (operation === "defer") {
    params.append(props.title === "Now" ? "defer" : "deferWeek", "true");
  }

  const response = await apiCall(`${BASE_URL}/delete?${params.toString()}`);
  if (response) {
    updateLocalStateAfterRemoval(ids);
    selectedItems.value = [];
    selectionMode.value = false;
  }
};

const removeItems = () => batchOperation("remove", selectedItems.value);
const deferItems = () => batchOperation("defer", selectedItems.value);

// Update Local State After Add
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
    const parent = todo.value.find((item) => item.id === parentId);
    if (parent) {
      const subIndex = afterId
        ? parent.subTasks.findIndex((subTask) => subTask.id === afterId)
        : -1;
      parent.subTasks.splice(subIndex + 1, 0, newItem);
    }
  }
};

// Update Local State After Edit
const updateLocalStateAfterEdit = (editedItem) => {
  const updateItem = (items) => {
    items.forEach((item) => {
      if (item.id === editedItem.id) {
        Object.assign(item, editedItem);
      }
      if (item.subTasks) updateItem(item.subTasks);
    });
  };
  updateItem(todo.value);
};

// Update Local State After Removal
const updateLocalStateAfterRemoval = (idsToRemove) => {
  drawRandomItem();
  const filterItems = (items) =>
    items
      .filter((item) => !idsToRemove.includes(item.id))
      .map((item) => ({
        ...item,
        subTasks: item.subTasks ? filterItems(item.subTasks) : [],
      }));
  todo.value = filterItems(todo.value);
};

// Dialog Handlers
const openAddDialog = (afterID, parentID) => {
  addDialog.value = true;
  addAfterID.value = afterID;
  addParentID.value = parentID;
};

const toggleExpanded = (itemId) => {
  if (expandedItems.value[itemId]) {
    delete expandedItems.value[itemId];
  } else {
    expandedItems.value[itemId] = true;
  }
};

// Selection Mode Management
const toggleSelectionMode = () => {
  selectionMode.value = !selectionMode.value;
  if (!selectionMode.value) selectedItems.value = [];
};

// Editing Handler
const toggleEditing = (item) => {
  if (item) {
    editDialogItem.value = item;
    editDialog.value = true;
  }
};

// Handle Item Click
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

// Format Date
const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString();
};

// Random Item
const drawRandomItem = () => {
  if (randomItemDialog.value) {
    const allItems = todo.value.flatMap((item) => [item, ...item.subTasks]);
    randomItem.value =
      allItems.length > 0
        ? { ...allItems[Math.floor(Math.random() * allItems.length)] }
        : null;
  }
};

const handleRandomItem = () => {
  randomItemDialog.value = true;
  drawRandomItem();
};

// Watchers
watch(
  () => showList.value,
  (newValue) => {
    if (newValue) fetchTodo();
  }
);

// Initial Fetch
if (showList.value) fetchTodo();
</script>
