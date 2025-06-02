<template>
  <v-card class="mx-auto" elevation="2" rounded="lg">
    <v-toolbar color="grey-darken-4" dark density="compact">
      <v-btn icon @click="showTasks = !showTasks">
        <v-icon>{{ showTasks ? "mdi-chevron-up" : "mdi-chevron-down" }}</v-icon>
      </v-btn>
      <v-toolbar-title>Google Tasks</v-toolbar-title>
      <v-btn icon @click="addDialog = true">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <v-select
        v-model="selectedTaskList"
        :items="taskLists"
        item-title="title"
        item-value="id"
        class="mr-2 w-1/12"
        variant="outlined"
        density="compact"
        hide-details
        @update:model-value="fetchTasks"
      ></v-select>
      <v-btn icon size="small" @click="$emit('expand')">
        <v-icon>mdi-arrow-expand</v-icon>
      </v-btn>
    </v-toolbar>

    <v-progress-linear v-if="apiIsLoading" indeterminate class="mx-auto"></v-progress-linear>

    <div v-show="showTasks">
      <!-- Quick Add Task -->
      <v-sheet class="pa-2 pb-1">
        <v-text-field
          v-model="quickTaskTitle"
          placeholder="Quick add task..."
          variant="outlined"
          density="compact"
          hide-details
          @keydown.enter="quickAddTask"
          append-inner-icon="mdi-plus"
          @click:append-inner="quickAddTask"
          class="mb-2"
        />
      </v-sheet>

      <!-- Statistics Header -->
      <v-sheet class="px-2 pb-1" v-if="tasks.length > 0">
        <div class="stats-container">
          <v-chip size="small" variant="text" class="mr-1">
            <v-icon size="12" class="mr-1">mdi-format-list-checks</v-icon>
            {{ taskStats.total }}
          </v-chip>
          <v-chip size="small" variant="text" color="info" class="mr-1" v-if="taskStats.fresh > 0">
            <v-icon size="12" class="mr-1">mdi-clock-fast</v-icon>
            {{ taskStats.fresh }}
          </v-chip>
          <v-chip size="small" variant="text" color="warning" class="mr-1" v-if="taskStats.stale > 0">
            <v-icon size="12" class="mr-1">mdi-clock-alert</v-icon>
            {{ taskStats.stale }}
          </v-chip>
          <v-chip size="small" variant="text" color="error" class="mr-1" v-if="taskStats.veryOld > 0">
            <v-icon size="12" class="mr-1">mdi-clock-remove</v-icon>
            {{ taskStats.veryOld }}
          </v-chip>
          <div class="ml-auto">
            <v-progress-linear
              :model-value="taskStats.freshPercentage"
              height="4"
              color="success"
              bg-color="grey-lighten-1"
              class="completion-progress"
            ></v-progress-linear>
          </div>
        </div>
      </v-sheet>

      <v-sheet class="pa-2">
        <div class="tasks-container">
          <v-list v-if="tasks.length > 0" class="py-0" density="compact">
            <v-list-item v-for="task in tasks" :key="task.id" :class="['border-b border-gray-200', getTaskAgeClass(task)]" @click="showTask(task)">
              <template v-slot:prepend>
                <v-checkbox
                  :model-value="task.status === 'completed'"
                  @click.stop="toggleTaskStatus(task)"
                  density="compact"
                  color="success"
                  hide-details
                ></v-checkbox>
              </template>

              <v-list-item-content class="py-1">
                <v-list-item-title :class="{ 'task-completed': task.status === 'completed' }" class="text-body-2 mb-1 ml-2">
                  {{ task.title }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption task-due ml-2">
                  <v-icon size="12" class="">mdi-clock-outline</v-icon>
                  {{ getTaskAge(task) }}
                  <span v-if="task.due" class="ml-2">
                    <v-icon size="12" class="mr-1">mdi-calendar-clock</v-icon>
                    {{ formatDate(task.due) }}
                  </span>
                </v-list-item-subtitle>
              </v-list-item-content>

              <template v-slot:append>
                <div class="task-actions">
                  <v-btn icon size="x-small" variant="text" color="grey" @click.stop="editTask(task)" class="mr-1">
                    <v-icon size="14">mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn icon size="x-small" variant="text" color="grey" @click.stop="deleteTask(task.id)">
                    <v-icon size="14">mdi-delete</v-icon>
                  </v-btn>
                </div>
              </template>
            </v-list-item>
          </v-list>

          <v-alert v-else-if="!apiIsLoading" type="info" variant="tonal" class="ma-2" density="compact">
            <template v-slot:prepend>
              <v-icon size="20">mdi-information</v-icon>
            </template>
            <div class="text-caption">No tasks found. Use the quick add above or click + to add your first task!</div>
          </v-alert>
        </div>
      </v-sheet>
    </div>

    <!-- Task Detail Modal -->
    <v-dialog v-model="showTaskDialog" max-width="500px" scroll-strategy="close">
      <v-card>
        <v-card-title class="headline">{{ selectedTask.title }}</v-card-title>
        <v-card-subtitle v-if="selectedTask.notes">
          {{ selectedTask.notes }}
        </v-card-subtitle>
        <v-card-text>
          <div v-if="selectedTask.due"><strong>Due:</strong> {{ selectedTask.due }}</div>
          <div><strong>Status:</strong> {{ selectedTask.status === "completed" ? "Completed" : "Pending" }}</div>
          <div v-if="selectedTask.completed"><strong>Completed:</strong> {{ selectedTask.completed }}</div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn :href="selectedTask.webViewLink" target="_blank" color="primary" v-if="selectedTask.webViewLink">
            <v-icon class="mr-1">mdi-open-in-new</v-icon>
            View in Google Tasks
          </v-btn>
          <v-btn text @click="editTask(selectedTask)" color="primary">
            <v-icon class="mr-1">mdi-pencil</v-icon>
            Edit
          </v-btn>
          <v-btn text @click="deleteTask(selectedTask.id)" color="red">
            <v-icon class="mr-1">mdi-delete</v-icon>
            Delete
          </v-btn>
          <v-btn text @click="showTaskDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add/Edit Task Modal -->
    <v-dialog v-model="addDialog" max-width="500px" scroll-strategy="close">
      <v-card>
        <v-card-title class="headline">{{ editingTask ? "Edit Task" : "Add a Task" }}</v-card-title>
        <v-card-text>
          <v-form ref="taskForm">
            <v-text-field v-model="newTask.title" label="Task Title" required :rules="[(v) => !!v || 'Task title is required']"></v-text-field>
            <v-textarea v-model="newTask.notes" label="Notes (optional)" rows="3" auto-grow></v-textarea>
            <v-row>
              <v-col cols="6">
                <v-btn icon @click="menuDue = !menuDue">
                  <v-icon>mdi-calendar</v-icon>
                </v-btn>
                <v-text-field v-model="newTask.due" label="Due Date (optional)"></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-checkbox v-model="newTask.completed" label="Mark as completed"></v-checkbox>
              </v-col>
            </v-row>
            <v-date-picker v-model="newTask.due" v-if="menuDue" @update:model-value="menuDue = false"></v-date-picker>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="grey darken-1" text @click="closeTaskDialog">Cancel</v-btn>
          <v-btn color="primary" text @click="saveTask">{{ editingTask ? "Update" : "Save" }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { useApi } from "@/useAPI.js";

const { getApiKey } = useApi();

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
});

const apiIsLoading = ref(false);
const addDialog = ref(false);
const tasks = ref([]);
const taskLists = ref([]);
const selectedTaskList = ref("");
const showTasks = ref(true);
const editingTask = ref(null);

// Quick Add functionality
const quickTaskTitle = ref("");

// Modal Data
const showTaskDialog = ref(false);
const selectedTask = ref({});

// New Task Data
const newTask = ref({
  title: "",
  notes: "",
  due: "",
  completed: false,
});
const menuDue = ref(false);

// Base API URL - adjust this to match your AWS Lambda endpoints that proxy Google Tasks API
const API_BASE_URL = "https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/getTasks";

let fresh = 0;
let freshThreshold = 7;
let stale = 0;
let staleThreshold = 30;
let veryOld = 0;
let veryOldThreshold = 60;

// Task Statistics
const taskStats = computed(() => {
  const total = tasks.value.length;
  const completed = tasks.value.filter((task) => task.status === "completed").length;
  const now = new Date();

  tasks.value.forEach((task) => {
    if (task.updated && task.status !== "completed") {
      const updatedDate = new Date(task.updated);
      const daysSinceUpdate = Math.floor((now - updatedDate) / (1000 * 60 * 60 * 24));

      if (daysSinceUpdate <= freshThreshold) {
        fresh++;
      } else if (daysSinceUpdate > freshThreshold && daysSinceUpdate <= staleThreshold) {
        stale++;
      } else if (daysSinceUpdate > staleThreshold) {
        veryOld++;
      }
    }
  });

  return {
    total,
    completed,
    fresh,
    stale,
    veryOld,
    freshPercentage: total > 0 ? Math.round((fresh / total) * 100) : 0,
  };
});

// Task Age Helper Functions
const getTaskAgeClass = (task) => {
  if (!task.updated || task.status === "completed") return "";

  const now = new Date();
  const updatedDate = new Date(task.updated);
  const daysSinceUpdate = Math.floor((now - updatedDate) / (1000 * 60 * 60 * 24));

  if (daysSinceUpdate > veryOldThreshold) return "task-very-old";
  if (daysSinceUpdate > staleThreshold) return "task-stale";
  if (daysSinceUpdate > freshThreshold) return "task-aging";

  return "";
};

const getTaskAge = (task) => {
  if (!task.updated) return "unknown";

  const now = new Date();
  const updatedDate = new Date(task.updated);
  const daysSinceUpdate = Math.floor((now - updatedDate) / (1000 * 60 * 60 * 24));
  const hoursSinceUpdate = Math.floor((now - updatedDate) / (1000 * 60 * 60));

  if (daysSinceUpdate === 0) {
    if (hoursSinceUpdate === 0) return "now";
    if (hoursSinceUpdate === 1) return "1hr ago";
    return `${hoursSinceUpdate}hrs ago`;
  }
  if (daysSinceUpdate === 1) return "1d ago";
  if (daysSinceUpdate < 7) return `${daysSinceUpdate}d ago`;
  if (daysSinceUpdate < 30) {
    const weeks = Math.floor(daysSinceUpdate / 7);
    const days = daysSinceUpdate % 7;
    return days === 0 ? `${weeks}w ago` : `${weeks}w ${days}d ago`;
  }
  const months = Math.floor(daysSinceUpdate / 30);
  const days = daysSinceUpdate % 30;
  return days === 0 ? `${months}m ago` : `${months}m ${days}d ago`;
};

const getTaskAgeChip = (task) => {
  if (!task.updated || task.status === "completed") return null;

  const now = new Date();
  const updatedDate = new Date(task.updated);
  const daysSinceUpdate = Math.floor((now - updatedDate) / (1000 * 60 * 60 * 24));

  if (daysSinceUpdate > veryOldThreshold) return { text: "STALE", color: "error" };
  if (daysSinceUpdate > staleThreshold) return { text: "OLD", color: "warning" };
  if (daysSinceUpdate <= freshThreshold) return { text: "FRESH", color: "success" };

  return null;
};

// Quick Add Task Function
const quickAddTask = async () => {
  if (!quickTaskTitle.value.trim() || !selectedTaskList.value) return;

  apiIsLoading.value = true;
  try {
    const taskData = {
      title: quickTaskTitle.value.trim(),
      status: "needsAction",
    };

    const response = await fetch(`${API_BASE_URL}/v1/lists/${selectedTaskList.value}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": getApiKey(),
      },
      body: JSON.stringify(taskData),
    });

    if (response.ok) {
      quickTaskTitle.value = "";
      fetchTasks();
    } else {
      console.error("Failed to create quick task");
    }
  } catch (error) {
    console.error("Error creating quick task:", error);
  } finally {
    apiIsLoading.value = false;
  }
};

const fetchTaskLists = async () => {
  try {
    // Google Tasks API: GET /tasks/v1/users/@me/lists
    const response = await fetch(`${API_BASE_URL}/v1/users/@me/lists`, {
      headers: {
        "X-Api-Key": getApiKey(),
      },
    });
    const data = await response.json();

    // Extract items from the response (Google Tasks API returns { items: [...] })
    taskLists.value = data.items || data;
    if (taskLists.value.length > 0 && !selectedTaskList.value) {
      selectedTaskList.value = taskLists.value[0].id;
    }
  } catch (error) {
    console.error("Failed to fetch task lists:", error);
  }
};

const fetchTasks = async () => {
  if (!selectedTaskList.value) return;

  apiIsLoading.value = true;
  try {
    // Google Tasks API: GET /tasks/v1/lists/{tasklist}/tasks
    const response = await fetch(`${API_BASE_URL}/v1/lists/${selectedTaskList.value}/tasks`, {
      headers: {
        "X-Api-Key": getApiKey(),
      },
    });
    const data = await response.json();

    // Extract items from the response and map to our component structure
    const taskItems = data.items || data;
    tasks.value = taskItems.map((task) => ({
      id: task.id,
      title: task.title,
      notes: task.notes || "",
      due: task.due ? formatDateForDisplay(task.due) : null,
      status: task.status, // "needsAction" or "completed"
      completed: task.completed ? formatDateForDisplay(task.completed) : null,
      webViewLink: task.webViewLink,
      etag: task.etag,
      updated: task.updated,
      position: task.position,
      parent: task.parent,
      selfLink: task.selfLink,
    }));
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
  } finally {
    apiIsLoading.value = false;
  }
};

const toggleTaskStatus = async (task) => {
  apiIsLoading.value = true;
  const newStatus = task.status === "completed" ? "needsAction" : "completed";

  try {
    // Google Tasks API: PATCH /tasks/v1/lists/{tasklist}/tasks/{task}
    const taskUpdate = {
      id: task.id,
      status: newStatus,
    };

    // If marking as completed, add completion timestamp
    if (newStatus === "completed") {
      taskUpdate.completed = new Date().toISOString();
    } else {
      // If marking as needsAction, remove completion timestamp
      taskUpdate.completed = null;
    }

    const response = await fetch(`${API_BASE_URL}/v1/lists/${selectedTaskList.value}/tasks/${task.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": getApiKey(),
      },
      body: JSON.stringify(taskUpdate),
    });

    if (response.ok) {
      fetchTasks();
    } else {
      console.error("Failed to update task status");
    }
  } catch (error) {
    console.error("Error updating task status:", error);
  } finally {
    apiIsLoading.value = false;
  }
};

const showTask = (task) => {
  selectedTask.value = { ...task };
  showTaskDialog.value = true;
};

const editTask = (task) => {
  editingTask.value = task;
  newTask.value = {
    title: task.title,
    notes: task.notes,
    due: task.due ? parseDisplayDateToInput(task.due) : "",
    completed: task.status === "completed",
  };
  addDialog.value = true;
  showTaskDialog.value = false;
};

const saveTask = async () => {
  const form = document.querySelector("form");
  if (form && !form.checkValidity()) {
    return;
  }

  apiIsLoading.value = true;

  try {
    const taskData = {
      title: newTask.value.title,
      notes: newTask.value.notes,
      status: newTask.value.completed ? "completed" : "needsAction",
    };

    // Handle due date - Google Tasks API expects RFC 3339 date format
    if (newTask.value.due) {
      const dueDate = new Date(newTask.value.due);
      // For due dates, only the date portion is used (time is discarded)
      taskData.due = dueDate.toISOString().split("T")[0] + "T00:00:00.000Z";
    }

    // Handle completion date
    if (newTask.value.completed) {
      taskData.completed = new Date().toISOString();
    }

    let response;
    if (editingTask.value) {
      // Update existing task - Google Tasks API: PATCH /tasks/v1/lists/{tasklist}/tasks/{task}
      taskData.id = editingTask.value.id;
      response = await fetch(`${API_BASE_URL}/v1/lists/${selectedTaskList.value}/tasks/${editingTask.value.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": getApiKey(),
        },
        body: JSON.stringify(taskData),
      });
    } else {
      // Create new task - Google Tasks API: POST /tasks/v1/lists/{tasklist}/tasks
      response = await fetch(`${API_BASE_URL}/v1/lists/${selectedTaskList.value}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": getApiKey(),
        },
        body: JSON.stringify(taskData),
      });
    }

    if (response.ok) {
      fetchTasks();
      closeTaskDialog();
    } else {
      const errorData = await response.json();
      console.error("Failed to save task:", errorData);
    }
  } catch (error) {
    console.error("Error saving task:", error);
  } finally {
    apiIsLoading.value = false;
  }
};

const deleteTask = async (taskId) => {
  if (!confirm("Are you sure you want to delete this task?")) {
    return;
  }

  apiIsLoading.value = true;
  try {
    // Google Tasks API: DELETE /tasks/v1/lists/{tasklist}/tasks/{task}
    const response = await fetch(`${API_BASE_URL}/v1/lists/${selectedTaskList.value}/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": getApiKey(),
      },
    });

    if (response.ok) {
      fetchTasks();
      showTaskDialog.value = false;
    } else {
      console.error("Failed to delete task");
    }
  } catch (error) {
    console.error("Error deleting task:", error);
  } finally {
    apiIsLoading.value = false;
  }
};

const closeTaskDialog = () => {
  addDialog.value = false;
  editingTask.value = null;
  newTask.value = {
    title: "",
    notes: "",
    due: "",
    completed: false,
  };
  menuDue.value = false;
};

// Helper function to format RFC 3339 dates for display
const formatDateForDisplay = (rfc3339Date) => {
  if (!rfc3339Date) return "";
  return new Date(rfc3339Date).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Helper function to parse display date back to input format
const parseDisplayDateToInput = (displayDate) => {
  if (!displayDate) return "";
  const date = new Date(displayDate);
  return date.toISOString().split("T")[0];
};

const formatDate = (dateString) => {
  return formatDateForDisplay(dateString);
};

// Initialize component
onMounted(async () => {
  if (!props.collapsed) {
    await fetchTaskLists();
    if (selectedTaskList.value) {
      fetchTasks();
    }
  }
});

// Watch for changes
watch(
  () => showTasks.value,
  async (newValue) => {
    if (newValue && taskLists.value.length === 0) {
      await fetchTaskLists();
      if (selectedTaskList.value) {
        fetchTasks();
      }
    }
  }
);

watch(
  () => props.collapsed,
  (newValue) => {
    showTasks.value = !newValue;
  }
);

if (props.collapsed) {
  showTasks.value = false;
}
</script>

<style scoped>
.v-card {
  width: 100%;
}

.v-list-item {
  border-bottom: 1px solid #e0e0e0;
}

.line-through {
  text-decoration: line-through;
}

.border-b {
  border-bottom: 1px solid #e0e0e0;
}

.border-gray-200 {
  border-color: #e5e7eb;
}

.text-gray-500 {
  color: #6b7280;
}

.tasks-container {
  max-height: 300px;
  overflow-y: auto;
}

.task-item {
  border-bottom: 1px solid #e0e0e0;
}

.task-completed {
  text-decoration: line-through;
}

.task-due {
  color: #6b7280;
}

.task-actions {
  margin-left: auto;
}

/* Task Age Highlighting */
.task-very-old {
  border-left: 4px solid #f44336 !important;
  background-color: rgba(244, 67, 54, 0.05);
}

.task-stale {
  border-left: 4px solid #ff9800 !important;
  background-color: rgba(255, 152, 0, 0.05);
}

.task-aging {
  border-left: 4px solid #2196f3 !important;
  background-color: rgba(33, 150, 243, 0.05);
}

/* Statistics Container */
.stats-container {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
}

.completion-progress {
  width: 60px;
  border-radius: 2px;
}

/* Quick Add Animation */
.v-text-field {
  transition: all 0.2s ease;
}

.v-text-field:focus-within {
  transform: scale(1.02);
}
</style>
