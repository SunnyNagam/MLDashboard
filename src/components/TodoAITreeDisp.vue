<template>
  <v-card class="mx-auto" elevation="2" rounded="lg">
    <v-toolbar color="grey-darken-4" dark density="compact">
      <v-btn icon @click="toggleTodos">
        <v-icon>{{ showTodos ? "mdi-chevron-up" : "mdi-chevron-down" }}</v-icon>
      </v-btn>
      <v-toolbar-title>Todo Categories {{ todoTree.reduce((sum, category) => sum + (category.children ? category.children.length : 0), 0) }}</v-toolbar-title>
      <v-btn icon="mdi-refresh" x-small @click="fetchTodos" />
      <v-btn x-small @click="toggleModel">
        <v-icon>{{ useInstantModel ? "mdi-flash" : "mdi-brain" }}</v-icon>
      </v-btn>
      <v-btn icon="mdi-arrow-expand" x-small @click="$emit('expand')" />
    </v-toolbar>

    <v-progress-linear v-if="apiIsLoading" indeterminate class="mx-auto"></v-progress-linear>

    <vue-markdown v-if="showTodos && summary" :source="summary" class="prose max-w-none markdown-preview w-full p-4 !text-white" />

    <tree v-show="showTodos" v-model="todoTree" :data="todoTree" group="todosParent"></tree>
  </v-card>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import Tree from "@/components/Tree.vue";
import { useApi } from "@/useAPI.js";
import Groq from "groq-sdk";
import VueMarkdown from "vue-markdown-render";
import { useNotesStore } from "@/stores/useNotesStore";

const { getApiKey } = useApi();
const props = defineProps({ collapsed: { type: Boolean, default: false } });

const showTodos = ref(!props.collapsed);
const todoTree = ref([]);
const apiIsLoading = ref(false);
const notes = ref([]);
let groq;
const cachedTodos = ref(null);
const summary = ref("");
const useInstantModel = ref(false);

const notesStore = useNotesStore();

watch(showTodos, (newValue) => newValue && loadTodos());

onMounted(() => {
  fetchGroqApiKey();
});

function toggleTodos() {
  showTodos.value = !showTodos.value;
}

function toggleModel() {
  useInstantModel.value = !useInstantModel.value;
  if (showTodos.value) {
    loadTodos();
  }
}

const apiCall = async (endpoint, method = "GET", body = null) => {
  try {
    const response = await fetch(endpoint, {
      method,
      headers: { "X-Api-Key": getApiKey() },
      body: body ? JSON.stringify(body) : null,
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching API:", error);
    throw error;
  }
};

async function fetchGroqApiKey() {
  const groqApiKey = await notesStore.findApiKey("Groq");
  if (groqApiKey) {
    groq = new Groq({
      apiKey: groqApiKey,
      dangerouslyAllowBrowser: true,
    });
  } else {
    console.error("Groq API key not found in notes");
  }
}

async function loadTodos() {
  apiIsLoading.value = true;
  if (cachedTodos.value) {
    await categorizeTodos(cachedTodos.value);
  } else {
    await fetchTodos();
  }
  apiIsLoading.value = false;
}

async function fetchTodos() {
  const data = await apiCall("https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/fetch?list_name=Now");
  const todos = data.Now || [];
  cachedTodos.value = todos;

  await categorizeTodos(todos);
}

async function categorizeTodos(todos) {
  // Use Groq to categorize todos
  const categorizedTodos = await categorizeTodosWithGroq(todos);

  todoTree.value = Object.entries(categorizedTodos).map(([category, items]) => ({
    text: `${category} [${items.length}]`,
    children: items.map((item) => ({
      text: item,
      children: [],
    })),
    count: items.length,
  }));
  todoTree.value.sort((a, b) => b.count - a.count);

  // Generate summary after categorization
  await generateSummary(todos, categorizedTodos);
}

async function generateSummary(todos, categorizedTodos) {
  if (!groq) {
    console.error("Groq client not initialized");
    summary.value = "Unable to generate summary at this time.";
    return;
  }

  const todoSummary = JSON.stringify(categorizedTodos);

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a consise and accurate AI assistant that analyzes todo lists to help the user become more efficient.",
        },
        {
          role: "user",
          content: `Consider the following categorized todo list: ${todoSummary}. Highlight the easiest tasks and tasks that can be grouped together. Make sure your response is short and to the point.`,
        },
      ],
      model: useInstantModel.value ? "llama-3.1-8b-instant" : "llama-3.1-70b-versatile",
    });

    summary.value = chatCompletion.choices[0]?.message?.content || "Unable to generate summary.";
  } catch (error) {
    console.error("Error generating summary with Groq:", error);
    summary.value = "Error generating summary. Please try again later.";
  }
}

async function categorizeTodosWithGroq(todos) {
  if (!groq) {
    console.error("Groq client not initialized");
    return fallbackCategorization(todos);
  }

  const todoTexts = todos.map((todo) => todo.text).join("\n");

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You carefully categorize personal todo list items to help batch tasks. Provide a JSON object with categories as keys and arrays of todo items as values. Such as { 'Category 1': ['Item 1', 'Item 2'], 'Category 2': ['Item 3', 'Item 4'] }. Only use each item once.",
        },
        {
          role: "user",
          content: `Categorize these todo items:\n${todoTexts}`,
        },
      ],
      model: useInstantModel.value ? "llama-3.1-8b-instant" : "llama-3.1-70b-versatile",
      response_format: { type: "json_object" },
    });

    const categorizedTodos = JSON.parse(chatCompletion.choices[0]?.message?.content || `{['text':'Error: '+${JSON.stringify(chatCompletion)}]`);

    return categorizedTodos;
  } catch (error) {
    console.error("Error categorizing todos with Groq:", error);
    return fallbackCategorization(todos);
  }
}

function fallbackCategorization(todos) {
  const categories = {};
  todos.forEach((todo) => {
    const category = todo.category || "Uncategorized";
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(todo);
  });
  return categories;
}

if (showTodos.value) {
  loadTodos();
}
</script>
<style scoped>
.prose :where(strong):not(:where([class~="not-prose"], [class~="not-prose"] *)) {
  color: white !important;
  font-weight: 600;
}
</style>
