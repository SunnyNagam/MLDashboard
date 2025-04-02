<template>
  <v-card class="todo-list" elevation="2" rounded="lg" :class="[isExpanded ? 'h-full d-flex flex-column' : '']">
    <v-toolbar color="grey-darken-4" dark density="compact" :elevation="8" border="bottom">
      <v-btn icon @click="toggleTodos">
        <v-icon>{{ showTodos ? "mdi-chevron-up" : "mdi-chevron-down" }}</v-icon>
      </v-btn>
      <v-toolbar-title>ToDo List</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-refresh" size="small" @click="loadTodos" />
      <v-btn icon="mdi-plus" @click="openItemDialog()"></v-btn>
      <v-btn icon="mdi-flash" size="small" @click="quickAddItem" v-tooltip="'Quick Add'"></v-btn>
      <v-btn icon="mdi-arrow-expand" size="small" @click="$emit('expand')" />
    </v-toolbar>

    <v-card-text v-show="showTodos" class="pa-1 pr-2 overflow-y-auto max-h-full">
      <draggable v-model="todoTasks" item-key="id" :animation="200" ghost-class="ghost-task" drag-class="dragging-task">
        <template #item="{ element }">
          <v-chip class="ma-1 justify-start mb-2 cursor-grab relative" @click="showTaskDetails(element)" :class="{ 'line-through': element.completed }">
            <template v-slot:prepend>
              <v-icon
                size="small"
                :icon="element.completed ? 'mdi-check-circle' : 'mdi-checkbox-blank-circle-outline'"
                @click.stop="toggleTaskCompleted(element)"
                class="text-purple-lighten-1 pr-2"
              ></v-icon>
            </template>
            {{ element.title }}
            <v-chip v-if="element.dueDate" size="x-small" color="grey" class="ml-1">{{ formatDate(element.dueDate) }}</v-chip>
          </v-chip>
        </template>
      </draggable>
    </v-card-text>

    <!-- Task Details Dialog -->
    <v-dialog v-model="itemDialog" max-width="500">
      <v-card>
        <v-card-title> {{ currentItem.id ? "Edit" : "Add New" }} To-Do </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="saveItem">
            <v-text-field v-model="currentItem.title" label="Title" required></v-text-field>
            <v-textarea v-model="currentItem.description" label="Description" rows="3"></v-textarea>
            <v-checkbox v-model="dueDateEnabled" label="Set due date" color="purple"></v-checkbox>
            <v-date-picker v-if="dueDateEnabled" v-model="currentItem.dueDate" label="Due Date"></v-date-picker>
            <v-checkbox v-if="currentItem.id" v-model="currentItem.completed" label="Mark as completed" color="purple"></v-checkbox>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn
            v-if="currentItem.id"
            color="error"
            @click="
              deleteItem(currentItem);
              itemDialog = false;
            "
          >
            Delete
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" @click="itemDialog = false">Cancel</v-btn>
          <v-btn color="purple" @click="saveItem" :disabled="!currentItem.title"> {{ currentItem.id ? "Save" : "Add" }} To-Do </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import draggable from "vuedraggable";
import { useApi } from "@/useAPI.js";

const { getApiKey } = useApi();

// Props
const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
  isExpanded: {
    type: Boolean,
    default: false,
  },
});

// Define emits
const emit = defineEmits(["expand"]);

// State
const todoTasks = ref([]);
const itemDialog = ref(false);
const dueDateEnabled = ref(false);
const showTodos = ref(!props.collapsed);
const apiIsLoading = ref(false);
const currentItem = ref({
  id: null,
  title: "",
  description: "",
  dueDate: null,
  completed: false,
  isTodo: true,
});

// API Base URL
const BASE_URL = "https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod";

// Toggle todos visibility
function toggleTodos() {
  showTodos.value = !showTodos.value;
}

// API Call Helper
const apiCall = async (endpoint, method = "GET", body = null) => {
  try {
    apiIsLoading.value = true;
    const response = await fetch(endpoint, {
      method,
      headers: { "X-Api-Key": getApiKey() },
      body: body ? JSON.stringify(body) : null,
    });
    return await response.json();
  } catch (error) {
    console.error("API call error:", error);
    return null;
  } finally {
    apiIsLoading.value = false;
  }
};

// Load saved todos from API or localStorage
const loadTodos = async () => {
  try {
    apiIsLoading.value = true;
    // Try to load from API first
    if (getApiKey()) {
      const todoData = await apiCall(`${BASE_URL}/getData?key=TodoList`);
      console.log(todoData);
      if (todoData) {
        todoTasks.value = todoData;
        return;
      }
    }

    // Fall back to localStorage if API fails or no API key
    const savedTodoState = localStorage.getItem("todoList");
    if (savedTodoState) {
      const data = JSON.parse(savedTodoState);
      if (data) {
        todoTasks.value = data;
        return;
      }
    }

    // If nothing loaded, use defaults
    todoTasks.value = [];
  } catch (error) {
    console.error("Error loading todos:", error);
    todoTasks.value = [];
  } finally {
    apiIsLoading.value = false;
  }
};

// Save current todos to API and localStorage
const saveTodos = async () => {
  // Save to localStorage
  localStorage.setItem("todoList", JSON.stringify(todoTasks.value));

  // Save to API if key exists
  if (getApiKey()) {
    apiCall(`${BASE_URL}/getData?key=TodoList`, "PUT", todoTasks.value);
  }
};

const showTaskDetails = (item) => {
  currentItem.value = { ...item };
  currentItem.value.dueDate = item.dueDate ? new Date(item.dueDate) : null;
  dueDateEnabled.value = !!item.dueDate;
  itemDialog.value = true;
};

const openItemDialog = () => {
  // Reset the form
  currentItem.value = {
    id: null,
    title: "",
    description: "",
    dueDate: null,
    completed: false,
    isTodo: true,
  };
  dueDateEnabled.value = false;
  itemDialog.value = true;
};

const saveItem = () => {
  const item = { ...currentItem.value };

  // Generate a new ID if this is a new item
  if (!item.id) {
    item.id = `todo-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }

  // Handle due date
  item.dueDate = dueDateEnabled.value ? item.dueDate : null;

  // Update or add to todoTasks
  if (item.id) {
    const index = todoTasks.value.findIndex((t) => t.id === item.id);
    if (index !== -1) {
      todoTasks.value[index] = item;
    } else {
      todoTasks.value.push(item);
    }
  } else {
    todoTasks.value.push(item);
  }

  itemDialog.value = false;
  saveTodos();
};

const deleteItem = async (item) => {
  // Get index for local removal
  const index = todoTasks.value.findIndex((t) => t.id === item.id);

  if (index !== -1) {
    // Remove from local state immediately for quick UI update
    todoTasks.value.splice(index, 1);

    // Use the API with removeById parameter if API key exists
    if (getApiKey()) {
      try {
        await apiCall(`${BASE_URL}/getData?key=TodoList&removeById=${item.id}`, "GET");
      } catch (error) {
        console.error("Error removing item:", error);
      }
    } else {
      // Just update localStorage if no API key
      localStorage.setItem(
        "todoList",
        JSON.stringify({
          todoTasks: todoTasks.value,
          lastSaved: new Date().toISOString(),
        })
      );
    }
  }
};

const toggleTaskCompleted = (task) => {
  task.completed = !task.completed;
  saveTodos();
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Quick add a single item using the new addTo API
const quickAddItem = async () => {
  // Show a simple dialog for quick add
  const title = prompt("Enter a quick todo item:");
  if (!title || title.trim() === "") return;

  const newItem = {
    id: `todo-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    title: title,
    completed: false,
    isTodo: true,
    createdAt: new Date().toISOString(),
  };

  // Add to local state first for immediate feedback
  todoTasks.value.push(newItem);

  // Save to API using the new addTo parameter if API key exists
  if (getApiKey()) {
    try {
      await apiCall(`${BASE_URL}/getData?key=TodoList&merge=true`, "PUT", newItem);
    } catch (error) {
      console.error("Error adding quick item:", error);
      // Fallback to full save if addTo method fails
      saveTodos();
    }
  } else {
    // If no API key, use the regular save method
    saveTodos();
  }
};

// Watch for changes to save state
watch(
  todoTasks,
  () => {
    saveTodos();
  },
  { deep: true }
);

// Load todos on component mount
onMounted(() => {
  loadTodos();
});
</script>

<style scoped>
.todo-list {
  max-height: 500px;
  display: flex;
  flex-direction: column;
}

.ghost-task {
  opacity: 0.5;
  background: rgba(255, 255, 255, 0.1);
  border: 1px dashed white;
}

.dragging-task {
  cursor: grabbing;
}
</style>
