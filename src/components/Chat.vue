<template>
  <v-card :class="[$attrs.class, 'mx-auto']" elevation="2" rounded="lg">
    <v-toolbar color="deep-purple" dark density="compact">
      <v-btn icon @click="showChat = !showChat">
        <v-icon>{{ showChat ? "mdi-chevron-up" : "mdi-chevron-down" }}</v-icon>
      </v-btn>
      <v-toolbar-title>Perplexity</v-toolbar-title>
      <v-btn icon @click="clearMessages">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
      <v-btn icon @click="dialog = true">
        <v-icon>mdi-cog</v-icon>
      </v-btn>
    </v-toolbar>
    <div v-show="showChat">
      <v-card-text class="h-[21vh] overflow-y-auto">
        <div
          class="space-y-2 py-2"
          v-for="(message, index) in messages.slice(1)"
          :key="message.content"
        >
          <div
            @click="showMenu(message, index + 1)"
            :class="{
              'text-right': message.role === 'user',
              'text-left': message.role === 'assistant',
            }"
          >
            <div
              :class="{
                'inline-block bg-blue-500 text-white p-2 rounded-l-lg':
                  message.role === 'user',
                'inline-block bg-gray-900 p-2 rounded-r-lg':
                  message.role === 'assistant',
              }"
              :ref="
                (el) => {
                  if (index === messages.length - 1) lastMessage = el;
                }
              "
            >
              <vue-markdown
                :source="message.content"
                :options="{ breaks: true }"
              />
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
      <v-card-actions>
        <v-text-field
          v-model="userInput"
          label="Type a message..."
          class="flex-grow-1"
          @keyup.enter="sendMessage"
          outlined
          hide-details
        ></v-text-field>
        <v-btn @click="sendMessage">
          {{ editingIndex === -1 ? "Send" : "Save" }}
        </v-btn>
      </v-card-actions>
    </div>
  </v-card>
  <v-dialog v-model="dialog" max-width="600">
    <v-card>
      <v-card-title class="headline">Chat AI settings</v-card-title>
      <v-card-text>
        Model:
        <v-select
          :items="modelChoices"
          v-model="selectedModel"
          label="Select a model"
          outlined
        ></v-select>
        <v-switch
          v-model="callAgent"
          label="Use Agent (beta)"
          color="deep-purple accent-4"
        ></v-switch>
        <v-form>
          <v-text-field
            v-model="apiKey"
            label="API Key"
            outlined
            hint="Enter your OpenRouter API key"
          ></v-text-field>
          <v-btn @click="saveApiKey">Save API Key</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import ollama from "ollama/browser";
import VueMarkdown from "vue-markdown-render";
import OpenAI from "openai";
import Cookies from "vue-cookies";
import { useAgent } from "@/useAgent.js";

const apiKey = ref(Cookies.get("OPEN_ROUTER_API_KEY"));
const msgMenu = ref(false);
const menuItem = ref(null);
const showChat = ref(true);
const showMenu = (message, index) => {
  msgMenu.value = !msgMenu.value;
  menuItem.value = { message, index };
};

function saveApiKey() {
  Cookies.set("OPEN_ROUTER_API_KEY", apiKey.value);
  openaiApi.apiKey = apiKey.value;
}

const openaiApi = new OpenAI({
  apiKey: Cookies.get("OPEN_ROUTER_API_KEY"),
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
});

const props = defineProps({
  context: {
    type: String,
    default: "",
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
});

if (props.collapsed) {
  showChat.value = false;
}

const selectedModel = ref("perplexity/llama-3-sonar-small-32k-online");
const modelChoices = [
  "anthropic/claude-3-haiku",
  "google/gemini-flash-1.5",
  "perplexity/llama-3-sonar-small-32k-online",
  "perplexity/llama-3-sonar-large-32k-online",
  "meta-llama/llama-3-8b-instruct",
  "Ollama3::phi3",
  "Ollama3::llama3:8b-instruct-q5_K_M",
];
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
  messages.value = messages.value.filter(
    (message, index) => message.role === "system" && index === 0
  );
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
  try {
    if (!selectedModel.value.startsWith("Ollama3")) {
      const stream = await openaiApi.chat.completions.create({
        model: selectedModel.value,
        messages: messages.value,
        stream: true,
      });
      messages.value.push({
        content: "",
        role: "assistant",
      });
      for await (const part of stream) {
        messages.value[messages.value.length - 1].content +=
          part.choices[0]?.delta?.content || "";
      }
    } else {
      const localModelName = selectedModel.value.split("::")[1];
      const response = await ollama.chat({
        model: localModelName,
        messages: messages.value,
        stream: true,
      });
      messages.value.push({
        content: "",
        role: "assistant",
      });
      for await (const part of response) {
        messages.value[messages.value.length - 1].content +=
          part.message.content;
      }
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
</script>
