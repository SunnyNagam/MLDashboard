<script setup>
import { ref } from "vue";
import { useTheme } from "vuetify";
import VueMarkdown from "vue-markdown-render";
import Groq from "groq-sdk";
import Cookies from "vue-cookies";

const markdownText = ref(`Enter text here`);
const activeTab = ref(0);
const instruction = ref("");

const groqApiKey = Cookies.get("GROQ_API_KEY");
const dialog = ref(false);
const newGroqApiKey = ref("");

const undoHistory = ref([]);
const redoHistory = ref([]);

const theme = useTheme();
theme.global.name.value = "light";

const groq = new Groq({
  apiKey: groqApiKey,
  dangerouslyAllowBrowser: true,
});

function saveGroqApiKey() {
  if (newGroqApiKey.value) {
    Cookies.set("GROQ_API_KEY", newGroqApiKey.value);
    dialog.value = false;
  }
}

async function updateMarkdownWithGroq() {
  try {
    undoHistory.value.push(markdownText.value);
    redoHistory.value = [];

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that modifies a document based on user instructions.You will always return the full complete resulting document and nothing else.",
        },
        {
          role: "user",
          content: `Given the following document:\n\n${markdownText.value}\n\nApply the following instruction: ${instruction.value}`,
        },
      ],
      model: "llama-3.1-8b-instant",
    });

    markdownText.value =
      chatCompletion.choices[0]?.message?.content || markdownText.value;
    instruction.value = "";
  } catch (error) {
    console.error("Error updating markdown with Groq:", error);
  }
}

function undoLastChange() {
  if (undoHistory.value.length > 0) {
    redoHistory.value.push(markdownText.value);
    markdownText.value = undoHistory.value.pop();
  }
}

function redoLastChange() {
  if (redoHistory.value.length > 0) {
    undoHistory.value.push(markdownText.value);
    markdownText.value = redoHistory.value.pop();
  }
}
</script>

<template>
  <v-container class="mx-auto max-w-screen-md">
    <div class="flex flex-col items-center mb-4">
      <h1 class="text-h2 font-bold mb-2">Instant Document Editor</h1>
      <h2 class="text-subtitle-1 mb-2">
        Write/preview your markdown in real-time and make changes instantly with
        Groq
      </h2>
    </div>

    <v-text-field
      v-model="instruction"
      label="Enter a modification"
      @keyup.enter="updateMarkdownWithGroq"
      append-icon="mdi-send"
      @click:append="updateMarkdownWithGroq"
      prepend-icon="mdi-key"
      @click:prepend="dialog = true"
      class="mt-4"
    >
    </v-text-field>

    <v-tabs v-model="activeTab">
      <v-tab>Editor</v-tab>
      <v-tab>Preview</v-tab>
      <v-btn
        icon
        @click="undoLastChange"
        :disabled="undoHistory.length === 0"
        title="Undo last change"
      >
        <v-icon>mdi-undo</v-icon>
      </v-btn>
      <v-btn
        icon
        @click="redoLastChange"
        :disabled="redoHistory.length === 0"
        title="Redo last change"
      >
        <v-icon>mdi-redo</v-icon>
      </v-btn>
    </v-tabs>

    <v-btn @click="dialog = true" v-if="!groqApiKey">Set Groq API Key</v-btn>

    <v-dialog v-model="dialog" max-width="400">
      <v-card>
        <v-card-title class="headline">Enter Groq API Key</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newGroqApiKey"
            label="Groq API Key"
            outlined
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="saveGroqApiKey">Save</v-btn>
          <v-btn @click="dialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-window v-model="activeTab">
      <v-window-item>
        <v-textarea
          v-model="markdownText"
          label="Markdown Input"
          rows="1"
          outlined
          class="markdown-input mt-4"
          auto-grow
        ></v-textarea>
      </v-window-item>
      <v-window-item class="w-full">
        <vue-markdown
          :source="markdownText"
          class="prose max-w-none markdown-preview bg-white w-full py-4"
        />
      </v-window-item>
    </v-window>
  </v-container>
</template>

<style scoped>
.markdown-input {
  font-family: monospace;
}

.markdown-preview {
  height: 100%;
  overflow-y: auto;
}

.prose {
  max-width: 100%;
}
</style>
