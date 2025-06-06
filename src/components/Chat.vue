<template>
  <v-card :class="['mx-auto', isExpanded ? 'h-full d-flex flex-column' : '']" elevation="2" rounded="lg">
    <v-toolbar color="grey-darken-4" dark density="compact">
      <v-btn icon @click="toggleChat">
        <v-icon>{{ showChat ? "mdi-chevron-up" : "mdi-chevron-down" }}</v-icon>
      </v-btn>
      <v-toolbar-title>Chat</v-toolbar-title>
      <v-spacer></v-spacer>

      <!-- Model Selector -->
      <v-select v-model="selectedModel" :items="modelChoices" dense hide-details bg-color="none"></v-select>

      <v-btn icon="mdi-cog" @click="editModelsDialog = true" />
      <v-btn icon="mdi-delete" @click="clearMessages" />
      <v-btn icon="mdi-arrow-expand" @click="$emit('expand')" />
    </v-toolbar>

    <div :class="['d-flex flex-column', isExpanded ? 'flex-grow-1' : '']">
      <v-card-text v-show="showChat" :class="['overflow-y-auto', isExpanded ? 'flex-grow-1' : 'h-[21vh]']">
        <div class="space-y-2 py-2" v-for="(message, index) in messages.slice(1)" :key="message.content">
          <div
            @click="showMenu(message, index + 1)"
            :class="{
              'text-right': message.role === 'user',
              'text-left': message.role === 'assistant',
            }"
          >
            <div
              :class="{
                'inline-block bg-blue-500 text-white p-2 rounded-l-lg': message.role === 'user',
                'inline-block bg-gray-900 p-2 rounded-r-lg': message.role === 'assistant',
              }"
              :ref="
                (el) => {
                  if (index === messages.length - 1) lastMessage = el;
                }
              "
            >
              <vue-markdown :source="message.content" :options="{ breaks: true }" />
            </div>
          </div>
          <div
            class="w-full rounded-lg"
            :class="{
              'text-right': message.role === 'user',
              'text-left': message.role === 'assistant',
            }"
            v-if="msgMenu && menuItem && menuItem.index === index + 1"
          >
            <v-btn
              icon="mdi-delete"
              variant="text"
              class="flex items-center"
              @click="
                deleteMessage(menuItem.index);
                msgMenu = false;
              "
            ></v-btn>
            <v-btn
              icon="mdi-content-copy"
              variant="text"
              class="flex items-center"
              @click="
                copyToClipboard(menuItem.message.content);
                msgMenu = false;
              "
            ></v-btn>
            <v-btn
              icon="mdi-pencil"
              variant="text"
              class="flex items-center"
              @click="
                enableEditMode(menuItem.index);
                msgMenu = false;
              "
            ></v-btn>
            <v-btn
              @click="
                cancelEditMode();
                msgMenu = false;
              "
              v-if="editingIndex !== -1"
            >
              Cancel
            </v-btn>
          </div>
        </div>
      </v-card-text>
      <v-card-actions v-show="showChat">
        <v-text-field v-model="userInput" label="Type a message..." class="flex-grow-1" @keyup.enter="sendMessage" outlined hide-details></v-text-field>
        <v-btn @click="sendMessage">
          {{ editingIndex === -1 ? "Send" : "Save" }}
        </v-btn>
      </v-card-actions>
    </div>

    <!-- Edit Models Dialog -->
    <v-dialog v-model="editModelsDialog" max-width="600">
      <v-card>
        <v-card-title>Edit Model Choices</v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="newModelName"
                  label="Add new model"
                  @keyup.enter="addModel"
                  append-icon="mdi-plus"
                  @click:append="addModel"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-list>
                  <v-list-item v-for="(model, index) in modelChoices" :key="index" class="mb-2">
                    <v-list-item-content>
                      <v-list-item-title>{{ model }}</v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-btn icon="mdi-delete" variant="text" @click="removeModel(index)"></v-btn>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" @click="editModelsDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import VueMarkdown from "vue-markdown-render";
import OpenAI from "openai";
import Tree from "@/components/Tree.vue";
import Cookies from "vue-cookies";
import { useAgent } from "@/useAgent.js";
import { useNotesStore } from "@/stores/useNotesStore";
import { useApi } from "@/useAPI.js";

const props = defineProps({
  context: {
    type: String,
    default: "",
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
  isExpanded: {
    type: Boolean,
    default: false,
  },
});

const notesStore = useNotesStore();

// API Base URL
const BASE_URL = "https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod";

const apiKey = ref("");
const msgMenu = ref(false);
const menuItem = ref(null);
const showChat = ref(!props.collapsed);
const editModelsDialog = ref(false);
const newModelName = ref("");
const toggleChat = () => {
  showChat.value = !showChat.value;
  props.collapsed = !showChat.value;
  console.log("showChat toggled:", showChat.value);
};

const openaiApi = ref(null); // Initialize as null; will set after fetching API key

const fetchOpenRouterApiKey = async () => {
  try {
    const openRouterKey = await notesStore.findApiKey("OpenRouter");
    if (openRouterKey) {
      apiKey.value = openRouterKey;
      Cookies.set("OPEN_ROUTER_API_KEY", apiKey.value);
      openaiApi.value = new OpenAI({
        apiKey: apiKey.value,
        baseURL: "https://openrouter.ai/api/v1",
        dangerouslyAllowBrowser: true,
      });
      console.log("OpenRouter API key has been set successfully.");
    } else {
      console.error("OpenRouter API key not found in notes.");
    }
  } catch (error) {
    console.error("Error fetching OpenRouter API key:", error);
  }
};

// API Call Helper
const apiCall = async (endpoint, method = "GET", body = null) => {
  try {
    const response = await fetch(endpoint, {
      method,
      headers: { "X-Api-Key": useApi().getApiKey() },
      body: body ? JSON.stringify(body) : null,
    });
    return await response.json();
  } catch (error) {
    console.error("API call error:", error);
    return null;
  }
};

// Load model choices from storage
const loadModelChoices = async () => {
  try {
    if (useApi().getApiKey()) {
      const data = await apiCall(`${BASE_URL}/getData?key=ChatModelChoices`);
      if (data && Array.isArray(data)) {
        modelChoices.value = data;
        return;
      }
    }

    // Fallback to localStorage if API fails or no API key
    const saved = localStorage.getItem("chatModelChoices");
    if (saved) {
      const data = JSON.parse(saved);
      if (Array.isArray(data)) {
        modelChoices.value = data;
        return;
      }
    }

    // If nothing loaded, use defaults
    modelChoices.value = [
      "anthropic/claude-3.7-sonnet",
      "perplexity/llama-3.1-sonar-small-128k-online",
      "nousresearch/hermes-2-pro-llama-3-8b",
      "meta-llama/llama-3.3-70b-instruct",
      "deepseek/deepseek-chat",
      "google/gemini-2.0-flash-lite-001",
      "deepseek/deepseek-r1-distill-llama-8b",
      "qwen/qwen-2.5-coder-32b-instruct",
      "google/gemini-2.0-flash-001",
    ];
  } catch (error) {
    console.error("Error loading model choices:", error);
  }
};

// Save model choices to storage
const saveModelChoices = async () => {
  // Save to localStorage
  localStorage.setItem("chatModelChoices", JSON.stringify(modelChoices.value));

  // Save to API if key exists
  if (useApi().getApiKey()) {
    apiCall(`${BASE_URL}/getData?key=ChatModelChoices`, "PUT", modelChoices.value);
  }
};

// Add new model
const addModel = () => {
  if (newModelName.value.trim()) {
    modelChoices.value.push(newModelName.value.trim());
    newModelName.value = "";
    saveModelChoices();
  }
};

// Remove model
const removeModel = (index) => {
  if (confirm(`Remove model "${modelChoices.value[index]}"?`)) {
    modelChoices.value.splice(index, 1);
    saveModelChoices();
  }
};

// Automatically fetch and apply the OpenRouter API key on component mount
onMounted(() => {
  fetchOpenRouterApiKey();
  loadModelChoices();
});

// Watch for changes to props.collapsed
watch(
  () => props.collapsed,
  (newValue) => {
    showChat.value = !newValue;
  }
);

const selectedModel = ref("perplexity/llama-3.1-sonar-small-128k-online");
const modelChoices = ref([]);
const dialog = ref(false);
const callAgent = ref(false);
let { invoke: invokeAgent } = callAgent.value ? await useAgent("") : {};

const messages = ref([
  {
    role: "system",
    content: `You are a proactive and helpful dashboard and planning assistant. ${props.context}`,
  },
]);

const clearMessages = () => {
  messages.value = messages.value.filter((message, index) => message.role === "system" && index === 0);
};

const lastMessage = ref(null);
const userInput = ref("");
const editingIndex = ref(-1); // Index of the message being edited, -1 when not editing
const userContext = ref("");

function enableEditMode(index) {
  editingIndex.value = index;
  userInput.value = messages.value[index].content; // Load the message content into the input field
  console.log(editingIndex.value);
}

function saveEditedMessage() {
  if (editingIndex.value !== -1) {
    messages.value[editingIndex.value].content = userInput.value;
    editingIndex.value = -1; // Reset editing index
    userInput.value = ""; // Clear input field
  }
}

function cancelEditMode() {
  editingIndex.value = -1;
  userInput.value = ""; // Clear input field
}

function showMenu(message, index) {
  msgMenu.value = !msgMenu.value;
  menuItem.value = { message, index };
}

watch(
  () => messages.value,
  () => {
    if (lastMessage.value) {
      lastMessage.value.scrollIntoView();
    }
  }
);

watch(
  () => props.context,
  async (newContext, oldContext) => {
    if (newContext !== oldContext) {
      messages.value[0] = {
        role: "system",
        content: `You are a helpful dashboard and planning assistant. ${newContext}`,
      };
      userContext.value = newContext;
    }
  }
);

watch(
  () => callAgent.value,
  async (newVal) => {
    if (newVal) {
      ({ invoke: invokeAgent } = await useAgent(userContext.value));
    }
  }
);

async function sendMessageToApi(userMessage) {
  if (!openaiApi.value) {
    console.error("OpenAI API is not initialized.");
    messages.value.push({
      content: "API is not initialized. Please try again later.",
      role: "assistant",
    });
    return;
  }

  try {
    const stream = await openaiApi.value.chat.completions.create({
      model: selectedModel.value,
      messages: messages.value,
      stream: true,
    });
    messages.value.push({
      content: "",
      role: "assistant",
    });
    for await (const part of stream) {
      messages.value[messages.value.length - 1].content += part.choices[0]?.delta?.content || "";
    }
  } catch (error) {
    console.error("Chat API error:", error);
    messages.value.push({
      content: "Error communicating with the chatbot.",
      role: "assistant",
    });
  }
}

async function sendAgentMessage(userMessage) {
  const agentMessage = {
    content: "",
    role: "assistant",
  };
  messages.value.push(agentMessage);
  const res = await invokeAgent(userMessage.content);
  messages.value[messages.value.length - 1].content = res.output;
  console.log(res);
}

function sendMessage() {
  if (userInput.value.trim()) {
    if (editingIndex.value !== -1) {
      saveEditedMessage();
    } else {
      const userMessage = {
        content: userInput.value,
        role: "user",
      };
      messages.value.push(userMessage);

      if (callAgent.value) sendAgentMessage(userMessage);
      else sendMessageToApi(userMessage);

      userInput.value = ""; // Clear input after sending
    }
  }
}

function deleteMessage(index) {
  messages.value.splice(index, 1);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
}

watch(showChat, (newVal) => {
  props.collapsed = !newVal;
  console.log("showChat changed to:", newVal);
});
</script>

<style scoped>
:deep(.v-toolbar) .v-btn {
  --v-btn-size: small;
}
</style>
