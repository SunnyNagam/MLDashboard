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
      <v-btn icon @click="toggleSort">
        <v-icon>mdi-sort-variant</v-icon>
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
            v-touch:swipe.left="() => defer(item.id)"
            v-touch:swipe.right="() => removeItem(item.id)"
            @touchstart="(e) => startSwipe(item.id, e.touches[0].clientX)"
            @touchmove="(e) => updateSwipe(item.id, e.touches[0].clientX)"
            @touchend="() => endSwipe(item.id)"
          >
            <template v-slot:prepend>
              <v-icon @click.stop="toggleExpanded(item.id)">
                {{
                  isExpanded(item.id) ? "mdi-chevron-up" : "mdi-chevron-down"
                }}
              </v-icon>
            </template>
            <template v-slot:append> </template>
            <div class="flex flex-1" @click="editItem(item)">
              <div class="flex-grow">
                <v-list-item-title>{{ item.text }}</v-list-item-title>
                <v-list-item-subtitle>
                  Created: {{ new Date(item.created).toDateString() }}
                </v-list-item-subtitle>
              </div>
              <div
                class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center invisible group-hover:visible space-x-2 bg-zinc-800 p-2 rounded-lg"
              >
                <v-icon
                  @click.stop="
                    addDialog = true;
                    addAfterID = item.id;
                  "
                >
                  mdi-table-row-plus-after
                </v-icon>
                <v-icon
                  @click.stop="
                    addDialog = true;
                    addParentID = item.id;
                  "
                >
                  mdi-plus
                </v-icon>
                <v-icon @click.stop="removeItem(item.id)" color="red">
                  mdi-delete
                </v-icon>
                <v-icon @click.stop="defer(item.id)">
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
          @click="editItem(subTask)"
          v-touch:swipe.left="() => defer(subTask.id)"
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
              <v-icon
                @click.stop="
                  addDialog = true;
                  addAfterID = subTask.id;
                  addParentID = item.id;
                "
              >
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

    <v-dialog v-model="addDialog" max-width="500px" scroll-strategy="close">
      <v-card>
        <v-card-title class="headline">Add a new item</v-card-title>

        <v-card-text>
          <v-text-field
            v-model="newItemText"
            label="New item"
            autofocus
            solo
            @keydown.enter="addItem(newItemText)"
          ></v-text-field>
        </v-card-text>

        <v-card-actions>
          <v-btn color="grey darken-1" text @click="addDialog = false"
            >Close</v-btn
          >
          <v-btn color="primary" text @click="addItem(newItemText)">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import TodoEditDialog from "./TodoEditDialog.vue";
import { useApi } from "@/useAPI.js";

const { setApiKey, getApiKey } = useApi();
const apiIsLoading = ref(false);

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

const fetchTodo = async () => {
  apiIsLoading.value = true;
  const response = await fetch(
    `https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/fetch?list_name=${props.title}`,
    {
      headers: {
        "X-Api-Key": getApiKey(),
      },
    }
  );
  const data = await response.json();
  todo.value = data[props.title];
  sortAsc.value = true;
  toggleSort();
  apiIsLoading.value = false;
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

const sortAsc = ref(true);
const toggleSort = () => {
  sortAsc.value = !sortAsc.value;
  todo.value.sort((a, b) => {
    if (sortAsc.value) {
      return new Date(a.created) - new Date(b.created);
    } else {
      return new Date(b.created) - new Date(a.created);
    }
  });
};

const showList = ref(true);
const addDialog = ref(false);
const addAfterID = ref(null);
const addParentID = ref(null);
const newItemText = ref("");

if (props.collapsed) {
  showList.value = false;
}

if (showList.value) {
  fetchTodo();
}

watch(
  () => showList.value,
  (newValue) => {
    if (newValue) {
      fetchTodo();
    }
  }
);

const editDialog = ref(false);
const editDialogItem = ref({});

const editItem = (item) => {
  if (item) {
    editDialogItem.value = item;
    editDialog.value = true;
  }
};

const saveEdit = async (text, id, item) => {
  apiIsLoading.value = true;
  editDialog.value = false;
  let endpoint = `https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/edit?text=${text}&block_id=${id}`;
  if (item.checked != undefined) {
    endpoint += `&todoToggle=${item.checked}`;
  }
  const response = await fetch(endpoint, {
    headers: {
      "X-Api-Key": getApiKey(),
    },
  });
  const data = await response.json();
  const parentIndex = todo.value.findIndex(
    (todo) => todo.id === data.parent.block_id
  );
  if (parentIndex !== -1) {
    const subtaskIndex = todo.value[parentIndex].subTasks.findIndex(
      (subTask) => subTask.id === item.id
    );
    todo.value[parentIndex].subTasks[subtaskIndex].text = text;
  } else {
    todo.value = todo.value.map((todo) =>
      todo.id === id ? { ...todo, text: text } : todo
    );
  }
  apiIsLoading.value = false;
};

const removeItem = async (id) => {
  apiIsLoading.value = true;
  const endpoint = `https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/delete?block_id=${id}`;
  const response = await fetch(endpoint, {
    headers: {
      "X-Api-Key": getApiKey(),
    },
  });
  const data = await response.json();
  todo.value = todo.value.filter((todo) => todo.id !== id);
  todo.value = todo.value.map((todo) =>
    todo.subTasks
      ? {
          ...todo,
          subTasks: todo.subTasks.filter((subTask) => subTask.id !== id),
        }
      : todo
  );
  apiIsLoading.value = false;
};

const defer = async (id) => {
  apiIsLoading.value = true;
  const endpoint = `https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/delete?block_id=${id}&defer=true`;
  const response = await fetch(endpoint, {
    headers: {
      "X-Api-Key": getApiKey(),
    },
  });
  const data = await response.json();
  todo.value = todo.value.filter((todo) => todo.id !== id);
  todo.value = todo.value.map((todo) =>
    todo.subTasks
      ? {
          ...todo,
          subTasks: todo.subTasks.filter((subTask) => subTask.id !== id),
        }
      : todo
  );
  apiIsLoading.value = false;
};

const addItem = async (text) => {
  apiIsLoading.value = true;
  let endpoint = `https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/add?text=${text}`;
  if (addAfterID.value) {
    endpoint += `&after_id=${addAfterID.value}`;
  }
  if (addParentID.value) {
    endpoint += `&parent_id=${addParentID.value}`;
  }
  const response = await fetch(endpoint, {
    headers: {
      "X-Api-Key": getApiKey(),
    },
  });
  const data = await response.json();

  function createNewItem(text, id) {
    return {
      text: text,
      id: id,
      created: new Date().toISOString(),
      checked: false,
      subTasks: [],
    };
  }

  if (!addParentID.value) {
    const index = addAfterID.value
      ? todo.value.findIndex((item) => item.id === addAfterID.value)
      : -1;
    todo.value.splice(index + 1, 0, createNewItem(text, data.results[0].id));
  } else {
    todo.value = todo.value.map((todoItem) => {
      if (todoItem.id === addParentID.value) {
        const subIndex = todoItem.subTasks.findIndex(
          (subTask) => subTask.id === addAfterID.value
        );
        todoItem.subTasks.splice(
          subIndex + 1,
          0,
          createNewItem(text, data.results[0].id)
        );
      }
      return todoItem;
    });
  }
  newItemText.value = "";
  addDialog.value = false;
  addAfterID.value = null;
  addParentID.value = null;
  apiIsLoading.value = false;
};

const toggleItem = async (parent_id, task_id, text, checked) => {
  const endpoint = `https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/edit?text=${text}&block_id=${task_id}&todoToggle=${checked}`;
  const response = await fetch(endpoint, {
    headers: {
      "X-Api-Key": getApiKey(),
    },
  });
  const data = await response.json();
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
      background: `radial-gradient(circle at right, rgba(255, 0, 0, ${
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
</script>

<style scoped>
.v-list-item {
  transition: background 0.1s ease;
}
</style>
