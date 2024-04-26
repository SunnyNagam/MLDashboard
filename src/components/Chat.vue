<template>
  <v-card class="mx-auto shadow-lg">
    <v-toolbar color="deep-purple accent-4" dark>
      <v-toolbar-title>Contextual Assistant</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="dialog = true">
        <v-icon>mdi-information</v-icon>
      </v-btn>
    </v-toolbar>
    <v-card-text class="h-64 overflow-y-auto">
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

const openai = new OpenAI({
  apiKey: Cookies.get("OPEN_ROUTER_API_KEY"), // defaults to process.env["OPENAI_API_KEY"]
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true, // Enable this if you used OAuth to fetch a user-scoped `apiKey` above. See https://openrouter.ai/docs#oauth to learn how.
});

const props = defineProps({
  context: {
    type: String,
    default: "",
  },
});

const selectedModel = ref("Ollama3");
const modelChoices = [
  "anthropic/claude-3-haiku",
  "microsoft/wizardlm-2-8x22b",
  "perplexity/sonar-medium-online",
  "Ollama3",
];
const dialog = ref(false);

const messages = ref([
  {
    role: "system",
    content:
      "You are a helpful dashboard and planning assistant." + props.context,
  },
]);

const lastMessage = ref(null);
const userInput = ref("");
watch(messages, () => {
  if (lastMessage.value) {
    lastMessage.value.scrollIntoView();
  }
});

watch(
  () => props.context,
  (newVal, oldVal) => {
    console.log(newVal);
    // handle the change here
    messages.value[0].content =
      "You are a helpful dashboard and planning assistant." + props.context;
  }
);
console.log(props.context);

const sendMessage = async () => {
  if (userInput.value.trim()) {
    // Update local messages with user input
    const userMessage = {
      content: userInput.value,
      role: "user",
    };
    messages.value.push(userMessage);

    // Prepare message for ollama
    const message = {
      role: "user",
      content: userInput.value,
    };

    userInput.value = ""; // Clear input after sending

    try {
      // Send message to ollama and await the response
      let response = null;

      if (selectedModel.value != "Ollama3") {
        const stream = await openai.chat.completions.create({
          model: selectedModel.value,
          messages: messages.value,
          stream: true,
        });
        // Process each part of the response
        messages.value.push({
          content: "",
          role: "assistant",
        });
        for await (const part of stream) {
          messages.value[messages.value.length - 1].content +=
            part.choices[0]?.delta?.content || "";
        }
      } else {
        response = await ollama.chat({
          model: "llama3",
          messages: messages.value,
          stream: true,
        });
        // Process each part of the response
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
  console.log(messages);
};
</script>

<style scoped></style>
