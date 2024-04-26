<template>
  <v-card class="mx-auto" max-width="600">
    <v-toolbar color="blue darken-2" dark>
      <v-btn icon @click="showList = !showList">
        <v-icon>{{ showList ? "mdi-chevron-up" : "mdi-chevron-down" }}</v-icon>
      </v-btn>

      <v-toolbar-title>{{ title }}</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn icon @click="toggleSort">
        <v-icon>mdi-sort-variant</v-icon>
      </v-btn>
    </v-toolbar>

    <v-list v-if="showList">
      <v-list-group v-for="item in todo" :key="item.id">
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            class="group"
            @click="toggleExpanded(item.id)"
          >
            <v-list-item-title>{{ item.text }}</v-list-item-title>
            <v-list-item-subtitle
              >Created:
              {{ new Date(item.created).toDateString() }}</v-list-item-subtitle
            >
            <template v-slot:prepend>
              <v-icon>{{
                isExpanded(item.id) ? "mdi-chevron-up" : "mdi-chevron-down"
              }}</v-icon>
            </template>
            <template v-slot:append>
              <div class="invisible group-hover:visible">
                <v-icon
                  @click.stop="
                    addDialog = true;
                    addAfterID = item.id;
                  "
                  >mdi-table-row-plus-after</v-icon
                >
                <v-icon
                  @click="
                    addDialog = true;
                    addParentID = item.id;
                  "
                  >mdi-plus</v-icon
                >
                <v-icon @click="removeItem(item.id)" color="red"
                  >mdi-delete</v-icon
                >
                <v-icon @click="editItem(item)">mdi-pencil</v-icon>
              </div>
            </template>
          </v-list-item>
        </template>

        <v-list-item
          v-for="subTask in item.subTasks"
          :key="subTask.id"
          class="group"
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
          <v-list-item-title>
            {{ subTask.text }}
          </v-list-item-title>
          <template v-slot:append>
            <div class="invisible group-hover:visible">
              <v-icon
                @click="
                  addDialog = true;
                  addAfterID = subTask.id;
                  addParentID = item.id;
                "
                >mdi-table-row-plus-after</v-icon
              >
              <v-icon @click="removeItem(subTask.id)" color="red"
                >mdi-delete</v-icon
              >
              <v-icon @click="editItem(subTask)">mdi-pencil</v-icon>
            </div>
          </template>
        </v-list-item>
      </v-list-group>
    </v-list>
  </v-card>
  <TodoEditDialog
    :active="editDialog"
    :item="editDialogItem"
    @save="saveEdit"
    @toggle="editDialog = $event"
  ></TodoEditDialog>
  <v-dialog v-model="addDialog" max-width="500px">
    <v-card>
      <v-card-title>
        <span class="text-h5">Add a new item</span>
      </v-card-title>

      <v-card-text>
        <v-text-field
          v-model="newItemText"
          label="New item"
          autofocus
        ></v-text-field>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="addDialog = false"
          >Close</v-btn
        >
        <v-btn color="blue darken-1" text @click="addItem(newItemText)"
          >Save</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from "vue";
import TodoEditDialog from "./TodoEditDialog.vue";
import { useApi } from "@/useAPI.js";

const { setApiKey, getApiKey } = useApi();

const props = defineProps({
  title: {
    type: String,
    default: "ToDo List",
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
});

const todo = ref([{ text: "Loading...", id: "..." }]);

const getTodo = async () => {
  console.log(todo.value);
  fetch("https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/fetch", {
    headers: {
      "X-Api-Key": getApiKey(),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      todo.value = data[props.title];
      console.log("Todo List index: ", props.title);
      console.log("Todo items:", data[props.title]);
    })
    .catch((error) => console.log("Error fetching data:", error));
};

const expandedItems = ref({});
const toggleExpanded = (itemId) => {
  console.log(todo.value);
  if (expandedItems.value[itemId]) {
    delete expandedItems.value[itemId];
  } else {
    expandedItems.value[itemId] = true;
  }
};

import { computed } from "vue";

const isExpanded = computed(() => {
  return (itemId) => !!expandedItems.value[itemId];
});

const sortAsc = ref(true); // Add this line
const toggleSort = () => {
  // Add this method
  sortAsc.value = !sortAsc.value;
  todo.sort((a, b) => {
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
  getTodo();
}

// only fetch data if the list is expanded
watch(
  () => showList.value,
  (newValue) => {
    if (newValue) {
      getTodo();
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
  console.log("Editing todo item:", text, id, item);
  let endpoint = `https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/edit?text=${text}&block_id=${id}`;
  if (item.checked != undefined) {
    endpoint = endpoint.concat(`&todoToggle=${item.checked}`);
  }
  console.log(endpoint);
  fetch(endpoint, {
    headers: {
      "X-Api-Key": getApiKey(),
    },
  })
    .then((response) => response.json())
    .then((response) => {
      console.log(response);
      if (item.checked != undefined) {
        todo.value = todo.value.map((todo) =>
          todo.id === response.parent.block_id
            ? {
                ...todo,
                subTasks: todo.subTasks.map((subTask) =>
                  subTask.id === item.id
                    ? { ...subTask, text: text, checked: item.checked }
                    : subTask
                ),
              }
            : todo
        );
      } else {
        todo.value = todo.value.map((todo) =>
          todo.id === id ? { ...todo, text: text } : todo
        );
      }
    })
    .catch((error) => console.log("Error fetching data:", error));
};

const removeItem = (id) => {
  const endpoint = `https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/delete?block_id=${id}`;
  console.log(endpoint);
  fetch(endpoint, {
    headers: {
      "X-Api-Key": getApiKey(),
    },
  })
    .then((response) => response.json())
    .then((response) => {
      console.log(response);
      todo.value = todo.value.filter((todo) => todo.id !== id);
      // also check subtasks
      todo.value = todo.value.map((todo) =>
        todo.subTasks
          ? {
              ...todo,
              subTasks: todo.subTasks.filter((subTask) => subTask.id !== id),
            }
          : todo
      );
    })
    .catch((error) => console.log("Error fetching data:", error));
};

const addItem = (text) => {
  console.log("Adding todo item:", text);
  let endpoint = `https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/add?text=${text}`;
  if (addAfterID.value) {
    endpoint = endpoint.concat(`&after_id=${addAfterID.value}`);
  }
  if (addParentID.value) {
    endpoint = endpoint.concat(`&parent_id=${addParentID.value}`);
  }
  console.log(endpoint);
  fetch(endpoint, {
    headers: {
      "X-Api-Key": getApiKey(),
    },
  })
    .then((response) => response.json())
    .then((response) => {
      console.log(response);
      if (!addParentID.value) {
        todo.value = todo.value.reduce((acc, item) => {
          acc.push(item);
          if (item.id === addAfterID.value) {
            acc.push({
              text: text,
              id: response.results[0].id,
              created: new Date().toISOString(),
            });
          }
          return acc;
        }, []);
      } else {
        todo.value = todo.value.map((todo) =>
          todo.id === addParentID.value
            ? addAfterID.value
              ? {
                  ...todo,
                  subTasks: todo.subTasks.reduce((acc, subTask) => {
                    acc.push(subTask);
                    if (subTask.id === addAfterID.value) {
                      acc.push({
                        text: text,
                        id: response.results[0].id,
                        created: new Date().toISOString(),
                        checked: false,
                      });
                    }
                    return acc;
                  }, []),
                }
              : {
                  ...todo,
                  subTasks: [
                    ...todo.subTasks,
                    {
                      text: text,
                      id: response.results[0].id,
                      created: new Date().toISOString(),
                      checked: false,
                    },
                  ],
                }
            : todo
        );
      }
    })
    .catch((error) => console.log("Error fetching data:", error))
    .finally(() => {
      newItemText.value = "";
      addDialog.value = false;
      addAfterID.value = null;
      addParentID.value = null;
    });
};

const toggleItem = (parent_id, task_id, text, checked) => {
  console.log("Toggling todo item:", parent_id, task_id, text, checked);
  console.log(todo.value);
  let endpoint = `https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/edit?text=${text}&block_id=${task_id}&todoToggle=${checked}`;
  console.log(endpoint);
  fetch(endpoint, {
    headers: {
      "X-Api-Key": getApiKey(),
    },
  })
    .then((response) => response.json())
    .then((response) => {
      console.log(response);
    })
    .catch((error) => console.log("Error fetching data:", error));
};
</script>
