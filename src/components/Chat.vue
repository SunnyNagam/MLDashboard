<template>
  <v-card class="mx-auto shadow-lg my-5" rounded="lg">
    <v-toolbar color="deep-purple accent-4" dark>
      <v-toolbar-title>Contextual Assistant</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="clearMessages">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
      <v-btn icon @click="dialog = true">
        <v-icon>mdi-information</v-icon>
      </v-btn>
    </v-toolbar>
    <v-card-text class="h-[50vh] overflow-y-auto">
      <div
        class="space-y-2 py-2"
        v-for="(message, index) in messages.slice(1)"
        :key="message.content"
      >
        <div
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
    </v-card-actions>
  </v-card>
  <v-dialog v-model="dialog" max-width="320">
    <v-card>
      <v-card-title class="headline">API Information</v-card-title>
      <v-card-text>
        Model:
        <v-select
          :items="modelChoices"
          v-model="selectedModel"
          label="Select a model"
          outlined
        ></v-select>
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
});

const selectedModel = ref("meta-llama/llama-3-8b-instruct");
const modelChoices = [
  "anthropic/claude-3-haiku",
  "microsoft/wizardlm-2-8x22b",
  "perplexity/sonar-medium-online",
  "meta-llama/llama-3-8b-instruct",
  "Ollama3",
];
const dialog = ref(false);

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
  (newContext, oldContext) => {
    if (newContext !== oldContext) {
      messages.value[0] = {
        role: "system",
        content: `You are a helpful dashboard and planning assistant. ${newContext}`,
      };
    }
  }
);

async function sendMessageToApi(userMessage) {
  try {
    if (selectedModel.value !== "Ollama3") {
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
      const response = await ollama.chat({
        model: "llama3",
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

function sendMessage() {
  if (userInput.value.trim()) {
    const userMessage = {
      content: userInput.value,
      role: "user",
    };
    messages.value.push(userMessage);
    sendMessageToApi(userMessage);
    userInput.value = ""; // Clear input after sending
  }
}
</script>
