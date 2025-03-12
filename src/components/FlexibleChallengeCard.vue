<template>
  <v-card :class="['mx-auto', isExpanded ? 'h-full d-flex flex-column' : '']" elevation="2" rounded="lg">
    <!-- Toolbar -->
    <v-toolbar color="grey-darken-4" dark density="compact" :elevation="8" border="bottom">
      <v-btn
        icon
        @click="
          showContent = !showContent;
          props.collapsed = !showContent;
        "
      >
        <v-icon>{{ showContent ? "mdi-chevron-up" : "mdi-chevron-down" }}</v-icon>
      </v-btn>

      <v-toolbar-title>ToDo</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn icon="mdi-arrow-expand" @click="$emit('expand')" />

      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon="mdi-sort" v-bind="props"></v-btn>
        </template>
        <v-list>
          <v-list-item @click="sortTasks('favorites')">
            <v-list-item-title>Sort by Favorites</v-list-item-title>
          </v-list-item>
          <v-list-item @click="sortTasks('duration')">
            <v-list-item-title>Sort by Duration</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon="mdi-dots-vertical" v-bind="props"></v-btn>
        </template>
        <v-list>
          <v-list-item @click="resetToDefaults">
            <v-list-item-title>Reset to Defaults</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-toolbar>

    <div v-if="showContent" :class="['d-flex flex-column', isExpanded ? 'flex-grow-1' : '']">
      <!-- Today's Activities Section -->
      <v-card-text class="pt-2 pb-0 px-2">
        <v-card class="today-card" color="grey-darken-4">
          <v-card-title class="d-flex align-center">
            <v-icon color="amber-lighten-1" class="mr-2">mdi-calendar-today</v-icon>
            <span
              >Today's Plan <span class="text-caption">{{ currentDate }}</span></span
            >
            <v-spacer></v-spacer>
            <div class="d-flex align-center">
              <v-chip size="small" color="amber">{{ totalTodayDuration }}</v-chip>
            </div>
          </v-card-title>

          <v-divider></v-divider>

          <v-card-text class="min-h-[60px] p-2">
            <draggable
              v-model="todayActivities"
              :group="{ name: 'tasks', pull: true, put: true }"
              item-key="id"
              class="flex flex-wrap min-h-[60px]"
              ghost-class="ghost-task"
              drag-class="dragging-task"
              :animation="200"
            >
              <template #item="{ element }">
                <v-chip
                  :color="element.color || (element.isTodo ? 'purple' : 'primary')"
                  variant="elevated"
                  class="ma-1 today-chip"
                  closable
                  @click:close="removeFromToday(element)"
                  @click="showTaskDetails(element)"
                >
                  <v-icon start size="small">{{ element.isTodo ? "mdi-check-circle-outline" : "mdi-checkbox-blank-circle-outline" }}</v-icon>
                  {{ element.title }}
                  <span v-if="element.dueDate" class="text-xs ms-2 text-grey-500"
                    >({{ new Date(element.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }})</span
                  >
                  <span v-if="element.duration" class="text-xs ms-2 text-grey-100">({{ element.duration }})</span>
                </v-chip>
              </template>
              <template #header>
                <div v-if="todayActivities.length === 0" class="text-center py-4 empty-today">
                  <v-icon size="large" color="grey-darken-1">mdi-drag</v-icon>
                  <div class="text-grey-darken-1 mt-2">Drag tasks here to plan your day</div>
                </div>
              </template>
            </draggable>
          </v-card-text>
        </v-card>
      </v-card-text>

      <!-- Options Columns -->
      <v-card-text>
        <div class="d-flex flex-column flex-md-row">
          <!-- To Do Column -->
          <v-card class="category-column mb-4 border-r border-red-500 border-2 flex-1">
            <v-card-title class="d-flex align-center gap-2 py-2">
              <v-icon color="purple-lighten-1">mdi-checkbox-marked-circle-outline</v-icon>
              <span>To-Do</span>
              <v-spacer></v-spacer>
              <v-btn icon="mdi-plus" size="x-small" @click="openItemDialog('todo')"></v-btn>
            </v-card-title>

            <v-divider></v-divider>

            <v-card-text class="flex-grow-1 overflow-y-auto pa-1 pr-2">
              <draggable
                v-model="todoTasks"
                :group="{ name: 'tasks', pull: true, put: true }"
                item-key="id"
                class="min-h-[200px]"
                :animation="200"
                ghost-class="ghost-task"
                drag-class="dragging-task"
              >
                <template #item="{ element }">
                  <v-chip
                    class="ma-1 w-full justify-start mb-2 cursor-grab relative"
                    @click="showTaskDetails(element)"
                    :class="{ 'line-through': element.completed }"
                  >
                    <template v-slot:prepend>
                      <v-icon
                        size="small"
                        :icon="element.completed ? 'mdi-check-circle' : 'mdi-checkbox-blank-circle-outline'"
                        @click.stop="element.completed = !element.completed"
                        class="text-purple-lighten-1 pr-2"
                      ></v-icon>
                    </template>
                    {{ element.title }}
                    <span v-if="element.dueDate" class="text-xs ms-2 text-grey-500"
                      >({{ new Date(element.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }})</span
                    >
                  </v-chip>
                </template>
              </draggable>
            </v-card-text>
          </v-card>

          <!-- Habits Column with 3 sections -->
          <v-card class="category-column mb-4 mb-md-0 flex-1 d-flex flex-column">
            <v-card-title class="d-flex align-center gap-2 py-2">
              <v-icon>mdi-lightning-bolt</v-icon>
              <span>Habits</span>
            </v-card-title>

            <v-divider></v-divider>

            <!-- Energy Level Sections -->
            <v-card-text class="flex-grow pa-0 overflow-y-auto max-h-full">
              <div v-for="category in categories" :key="category.level" class="rounded overflow-hidden border border-white border-opacity-10">
                <div class="d-flex align-center w-100 px-3 min-h-[40px] font-medium">
                  <span class="mr-2">{{ category.icon }}</span>
                  <span class="font-weight-medium">{{ category.level }}</span>
                  <v-spacer></v-spacer>
                  <v-btn
                    icon="mdi-plus"
                    size="x-small"
                    @click.stop="
                      () => {
                        openItemDialog('task');
                        currentItem.energyLevel = categories.find((c) => c.level === category.level);
                        currentItem.level = category.level;
                      }
                    "
                  ></v-btn>
                </div>

                <div class="pr-2">
                  <draggable
                    v-model="filteredTasks[category.level]"
                    :group="{ name: 'tasks', pull: true, put: true }"
                    item-key="id"
                    class="min-h-[50px] p-1"
                    @change="handleDragChange"
                    :animation="200"
                    ghost-class="ghost-task"
                    drag-class="dragging-task"
                  >
                    <template #item="{ element }">
                      <v-chip :color="element.color || undefined" class="ma-1 w-full justify-start cursor-grab relative" @click="showTaskDetails(element)">
                        <template v-slot:prepend>
                          <v-icon
                            size="small"
                            :icon="element.favorite ? 'mdi-star' : 'mdi-star-outline'"
                            @click.stop="
                              element.favorite = !element.favorite;
                              saveState();
                            "
                            :color="element.favorite ? 'amber' : ''"
                            class="pr-2"
                          ></v-icon>
                        </template>
                        {{ element.title }}
                        <span class="text-xs ms-2 text-grey-100">({{ element.duration }})</span>
                      </v-chip>
                    </template>
                  </draggable>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
    </div>

    <v-dialog v-model="itemDialog" max-width="500">
      <v-card>
        <v-card-title>
          {{ currentItem.id ? "Edit" : "Add New" }}
          {{ currentItem.type === "todo" ? "To-Do Task" : "Habit Option" }}
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="saveItem">
            <v-text-field v-model="currentItem.title" label="Title" required></v-text-field>
            <v-textarea v-model="currentItem.description" label="Description" rows="3"></v-textarea>

            <!-- Task-specific fields -->
            <template v-if="currentItem.type === 'task'">
              <v-text-field v-model="currentItem.duration" label="Duration (e.g. '15 mins')"></v-text-field>
              <v-select v-model="currentItem.color" :items="colorOptions" label="Color" clearable></v-select>
              <v-select v-model="currentItem.energyLevel" :items="categories" item-title="level" label="Energy Level" return-object></v-select>
            </template>

            <!-- Todo-specific fields -->
            <template v-else>
              <v-checkbox v-model="dueDateEnabled" label="Set due date" color="purple"></v-checkbox>
              <v-date-picker v-if="dueDateEnabled" v-model="currentItem.dueDate" label="Due Date"></v-date-picker>
              <v-checkbox v-if="currentItem.id" v-model="currentItem.completed" label="Mark as completed" color="purple"></v-checkbox>
            </template>
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
          <v-btn :color="currentItem.type === 'todo' ? 'purple' : 'success'" @click="saveItem" :disabled="!currentItem.title">
            {{ currentItem.id ? "Save" : "Add" }} {{ currentItem.type === "todo" ? "To-Do" : "Option" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
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

// Emits
defineEmits(["expand"]);

// State
const showContent = ref(!props.collapsed);
const selectedTask = ref(null);
const apiIsLoading = ref(false);
const itemDialog = ref(false);
const dueDateEnabled = ref(false);

// New task forms
const currentItem = ref({
  id: null,
  title: "",
  description: "",
  type: null, // 'todo' or 'task'
  // Common fields for both types
  color: "",
  // Task-specific fields
  duration: "",
  energyLevel: null,
  level: null,
  favorite: false,
  // Todo-specific fields
  dueDate: null,
  completed: false,
  isTodo: false,
});

// Energy level categories
const categories = [
  { level: "Low Options", icon: "🌧️", color: "blue-grey", bgColor: "blue-grey-darken-4" },
  { level: "Medium Options", icon: "🌤️", color: "amber", bgColor: "amber-darken-4" },
  { level: "High Options", icon: "🌞", color: "success", bgColor: "success-darken-4" },
];

// Color options for tasks
const colorOptions = ["primary", "secondary", "success", "info", "warning", "error", "blue", "green", "purple", "teal", "cyan"];

// Initial tasks database
const tasksDB = {
  "Low Options": [
    {
      id: "l1",
      title: "5-min walk",
      description: "A quick walk around the block to get some fresh air",
      duration: "5 mins",
      level: "Low Options",
    },
    { id: "l2", title: "Quick shower/self-care", description: "Basic self-care routine", duration: "10 mins", level: "Low Options" },
    {
      id: "l3",
      title: "Short journaling",
      description: "Write down current thoughts and feelings",
      duration: "5 mins",
      level: "Low Options",
    },
    { id: "l4", title: "5-min meditation", description: "Brief mindfulness practice", duration: "5 mins", level: "Low Options" },
  ],
  "Medium Options": [
    {
      id: "m1",
      title: "15-min home workout",
      description: "Quick home fitness routine (HFR)",
      duration: "15 mins",
      level: "Medium Options",
    },
    { id: "m2", title: "20-30 min coding", description: "Short coding practice session", duration: "25 mins", level: "Medium Options" },
    {
      id: "m3",
      title: "Quick social interaction",
      description: "Brief chat or call with friend/family",
      duration: "15 mins",
      level: "Medium Options",
    },
    { id: "m4", title: "Cook easy meal", description: "Prepare a simple, healthy meal", duration: "30 mins", level: "Medium Options" },
  ],
  "High Options": [
    { id: "h1", title: "Full gym session", description: "Complete workout at the gym", duration: "60 mins", level: "High Options" },
    {
      id: "h2",
      title: "Exciting coding project",
      description: "Work on a challenging coding project",
      duration: "60+ mins",
      level: "High Options",
    },
    { id: "h3", title: "Social event", description: "Attend or plan a social gathering", duration: "Flexible", level: "High Options" },
    { id: "h4", title: "New experience", description: "Try something new and stimulating", duration: "Flexible", level: "High Options" },
  ],
};

// Initial to-do tasks
const todosDB = [
  { id: "todo1", title: "Pay electricity bill", description: "Due on the 15th", dueDate: "2024-08-15", isTodo: true, completed: false },
  {
    id: "todo2",
    title: "Call dentist",
    description: "Schedule appointment for cleaning",
    dueDate: "2024-07-22",
    isTodo: true,
    completed: false,
  },
  {
    id: "todo3",
    title: "Order new laptop",
    description: "Research models and pricing",
    dueDate: "2024-07-30",
    isTodo: true,
    completed: false,
  },
];

// Get today's date formatted
const currentDate = computed(() => {
  return new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
});

// Calculate total duration of today's tasks
const totalTodayDuration = computed(() => {
  if (todayActivities.value.length === 0) return "0 mins";

  let totalMinutes = 0;
  todayActivities.value.forEach((task) => {
    // Simpler regex extraction
    const match = task.duration?.match(/\d+/);
    totalMinutes += match ? parseInt(match[0]) : 0;
  });

  return `${totalMinutes} mins`;
});

// Reactive task lists for each mood
const categoryTasks = ref({
  "Low Options": [...tasksDB["Low Options"]],
  "Medium Options": [...tasksDB["Medium Options"]],
  "High Options": [...tasksDB["High Options"]],
});

// To-Do tasks list
const todoTasks = ref([...todosDB]);

// Today's activities list
const todayActivities = ref([]);

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

// Load saved state from API or localStorage
const loadSavedState = async () => {
  try {
    // Try to load from API first
    if (getApiKey()) {
      const data = await apiCall(`${BASE_URL}/getData?key=HabitAndTodoHub`);
      if (data && data.categoryTasks) {
        categoryTasks.value = data.categoryTasks;
        if (data.todayActivities) {
          todayActivities.value = data.todayActivities;
        }
        if (data.todoTasks) {
          todoTasks.value = data.todoTasks;
        }
        return;
      }
    }

    // Fall back to localStorage if API fails or no API key
    const savedState = localStorage.getItem("habitAndTodoHub");
    if (savedState) {
      const data = JSON.parse(savedState);
      categoryTasks.value = data.categoryTasks;
      if (data.todayActivities) {
        todayActivities.value = data.todayActivities;
      }
      if (data.todoTasks) {
        todoTasks.value = data.todoTasks;
      }
    }
  } catch (error) {
    console.error("Error loading saved state:", error);
  }
};

// Save current state to API and localStorage
const saveState = async () => {
  const stateToSave = {
    categoryTasks: categoryTasks.value,
    todayActivities: todayActivities.value,
    todoTasks: todoTasks.value,
    lastSaved: new Date().toISOString(),
  };

  // Save to localStorage
  localStorage.setItem("habitAndTodoHub", JSON.stringify(stateToSave));

  // Simplified API call - remove try/catch for one-time component
  if (getApiKey()) {
    apiCall(`${BASE_URL}/getData?key=HabitAndTodoHub`, "PUT", stateToSave);
  }
};

const removeFromToday = (activity) => {
  const index = todayActivities.value.findIndex((a) => a.id === activity.id);
  if (index !== -1) {
    const task = todayActivities.value[index];

    // Simplified - we know the task exists and has either isTodo or level
    if (task.isTodo) {
      todoTasks.value.push(task);
    } else {
      categoryTasks.value[task.level].push(task);
    }
    todayActivities.value.splice(index, 1);
  }
};

const showTaskDetails = (item) => {
  openItemDialog(item.isTodo ? "todo" : "task", item);
};

// Combine sorting methods into one
const sortTasks = (criterion) => {
  const parseDuration = (duration) => {
    if (!duration || duration === "Flexible") return Infinity;
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : Infinity;
  };

  const sortBy = (a, b) => {
    if (criterion === "favorites") {
      if (a.favorite && !b.favorite) return -1;
      if (!a.favorite && b.favorite) return 1;
    } else if (criterion === "duration") {
      return parseDuration(a.duration) - parseDuration(b.duration);
    }
    return a.title.localeCompare(b.title);
  };

  for (const category in categoryTasks.value) {
    categoryTasks.value[category].sort(sortBy);
  }
  todoTasks.value.sort(sortBy);
  saveState();
};

const openItemDialog = (type, item = null) => {
  // Reset the form
  currentItem.value = {
    id: null,
    title: "",
    description: "",
    type: type,
    color: "",
    duration: type === "task" ? "15 mins" : "",
    energyLevel: null,
    level: null,
    favorite: false,
    dueDate: null,
    completed: false,
    isTodo: type === "todo",
  };

  // If editing an existing item, populate the form
  if (item) {
    Object.keys(item).forEach((key) => {
      if (key in currentItem.value) {
        currentItem.value[key] = item[key];
      }
    });

    // Set the energy level object for tasks
    if (type === "task" && item.level) {
      currentItem.value.energyLevel = categories.find((c) => c.level === item.level);
    }

    // Handle due date for todos
    if (type === "todo") {
      dueDateEnabled.value = !!item.dueDate;
      if (item.dueDate) {
        currentItem.value.dueDate = new Date(item.dueDate);
      }
    }
  }

  itemDialog.value = true;
};

const saveItem = () => {
  const item = { ...currentItem.value };

  // Generate a new ID if this is a new item
  if (!item.id) {
    item.id = `${item.type}${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }

  if (item.type === "task") {
    // Handle task-specific fields
    item.level = item.energyLevel?.level;
    item.duration = item.duration || "Flexible";

    // Save to appropriate collection
    if (item.id) {
      // Update existing task
      for (const category in categoryTasks.value) {
        const index = categoryTasks.value[category].findIndex((t) => t.id === item.id);
        if (index !== -1) {
          categoryTasks.value[category].splice(index, 1);
          break;
        }
      }
    }

    categoryTasks.value[item.level].push(item);
  } else {
    // Handle todo-specific fields
    item.dueDate = dueDateEnabled.value ? item.dueDate : null;

    // Save to todo collection
    if (item.id) {
      // Update existing todo
      const index = todoTasks.value.findIndex((t) => t.id === item.id);
      if (index !== -1) {
        todoTasks.value.splice(index, 1);
      }
    }

    todoTasks.value.push(item);
  }

  itemDialog.value = false;
  saveState();
};

const deleteItem = (item) => {
  if (item.isTodo) {
    // Remove from todo list
    const index = todoTasks.value.findIndex((t) => t.id === item.id);
    if (index !== -1) {
      todoTasks.value.splice(index, 1);
    }
  } else {
    // Find which category the task belongs to
    for (const [category, tasks] of Object.entries(categoryTasks.value)) {
      const index = tasks.findIndex((t) => t.id === item.id);
      if (index !== -1) {
        categoryTasks.value[category].splice(index, 1);
        break;
      }
    }
  }

  // Also remove from today if it's there
  removeFromToday(item);
  saveState();
};

const handleDragChange = (evt) => {
  // Handle when items are added to a category from Today
  if (evt.added) {
    const task = evt.added.element;
    // If it's a Todo that was mistakenly dragged to a habit category, move it back to todos
    if (!task.isTodo) {
      task.level = findTaskCategory(task);
    }
  }
  saveState();
};

// Watch for changes in categoryTasks to save state
watch(
  [categoryTasks, todoTasks, todayActivities],
  () => {
    saveState();
  },
  { deep: true }
);

// Load saved state on component mount
onMounted(() => {
  loadSavedState();
});

const filteredTasks = computed(() => {
  return categoryTasks.value;
});

const findTaskCategory = (task) => {
  if (task.isTodo) return "todo";

  for (const category in categoryTasks.value) {
    if (categoryTasks.value[category].some((t) => t.id === task.id)) {
      return category;
    }
  }
};

const resetToDefaults = () => {
  if (confirm("This will reset all your habit options and todo tasks to defaults. Continue?")) {
    categoryTasks.value = {
      "Low Options": [...tasksDB["Low Options"]],
      "Medium Options": [...tasksDB["Medium Options"]],
      "High Options": [...tasksDB["High Options"]],
    };
    todoTasks.value = [...todosDB];
    todayActivities.value = [];
    saveState();
  }
};

watch(
  () => props.collapsed,
  (newValue) => {
    showContent.value = !newValue;
  }
);
</script>

<style scoped>
.category-column {
  min-height: 300px;
  max-height: 500px;
  display: flex;
  flex-direction: column;
}

.todo-column {
  border-left: 2px solid rgba(156, 39, 176, 0.3);
}

.today-card {
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.today-chip {
  margin: 4px !important;
  flex-grow: 0;
}

.empty-today {
  width: 100%;
  opacity: 0.8;
}

@media (max-width: 960px) {
  .category-column {
    min-height: 200px;
    max-height: 300px;
  }

  .v-card-title {
    font-size: 1rem;
  }
}

.ghost-task {
  opacity: 0.5;
  background: rgba(255, 255, 255, 0.1);
  border: 1px dashed white;
}

.dragging-task {
  cursor: grabbing;
}

/* Fix Safari scrolling issues if any */
.overflow-y-auto {
  -webkit-overflow-scrolling: touch;
}
</style>
