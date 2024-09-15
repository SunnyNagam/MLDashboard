<script setup>
import { ref, watch } from "vue"; // Added watch
import { useTheme } from "vuetify";
import VueMarkdown from "vue-markdown-render";
import Groq from "groq-sdk";
import { useApi } from "@/useAPI.js";
import Tree from "@/components/Tree.vue";
import Cookies from "vue-cookies";

const { setApiKey, getApiKey } = useApi();

const markdownText = ref(`Enter text here`);
const activeTab = ref(0);
const instruction = ref("");

let groqApiKey = Cookies.get("GROQ_API_KEY");
const dialog = ref(false);
let newGroqApiKey = ref("");

const undoHistory = ref([]);
const redoHistory = ref([]);

const theme = useTheme();
theme.global.name.value = "light";

const groq = new Groq({
  apiKey: groqApiKey,
  dangerouslyAllowBrowser: true,
});

const notes = ref([]);

// Added apiIsLoading for saveDocument and fetchDocument
const apiIsLoading = ref(false);

// Function to fetch Groq API Key
const fetchGroqApiKey = async () => {
  const response = await fetch(
    "https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/getData?key=Notes",
    {
      headers: {
        "X-Api-Key": getApiKey(),
      },
    }
  );
  const data = await response.json();
  notes.value = data.filter((item) => item.text === "API keys");
  notes.value = notes.value[0].children.filter((item) => item.text === "Groq");
};

fetchGroqApiKey();

// Function to save Groq API Key
function saveGroqApiKey() {
  if (newGroqApiKey.value) {
    Cookies.set("GROQ_API_KEY", newGroqApiKey.value);
    groqApiKey = newGroqApiKey.value;
    groq = new Groq({
      apiKey: groqApiKey,
      dangerouslyAllowBrowser: true,
    });
    dialog.value = false;
  }
}

// Function to update Markdown with Groq
async function updateMarkdownWithGroq() {
  try {
    undoHistory.value.push({
      text: markdownText.value,
      instruction: instruction.value,
    });
    redoHistory.value = [];

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that modifies a document based on user instructions. You will always return the full complete resulting modified document and nothing else.",
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

// Function to undo last change
function undoLastChange() {
  if (undoHistory.value.length > 0) {
    redoHistory.value.push({
      text: markdownText.value,
      instruction: instruction.value,
    }); // Store current instruction
    const lastChange = undoHistory.value.pop();
    markdownText.value = lastChange.text;
    instruction.value = lastChange.instruction; // Restore instruction
    console.log(lastChange);
    console.log(undoHistory.value);
    console.log(redoHistory.value);
  }
}

// Function to redo last change
function redoLastChange() {
  if (redoHistory.value.length > 0) {
    undoHistory.value.push({
      text: markdownText.value,
      instruction: instruction.value,
    }); // Store current instruction
    const lastRedo = redoHistory.value.pop();
    markdownText.value = lastRedo.text;
    instruction.value = lastRedo.instruction; // Restore instruction
  }
}

// **Added Functions Below**

// Function to save the current document to the server
async function saveDocument() {
  apiIsLoading.value = true;
  try {
    await fetch(
      "https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/getData?key=Document",
      {
        method: "PUT",
        headers: {
          "X-Api-Key": getApiKey(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: markdownText.value }),
      }
    );
  } catch (error) {
    console.error("Error saving document:", error);
  } finally {
    apiIsLoading.value = false;
  }
}

// Function to load the current document from the server
async function loadDocument() {
  apiIsLoading.value = true;
  try {
    const response = await fetch(
      "https://c6xl1u1f5a.execute-api.us-east-2.amazonaws.com/Prod/getData?key=Document",
      {
        headers: {
          "X-Api-Key": getApiKey(),
        },
      }
    );
    const data = await response.json();
    markdownText.value = data.text || "Enter text here";
  } catch (error) {
    console.error("Error loading document:", error);
  } finally {
    apiIsLoading.value = false;
  }
}

// Watcher to save the document after every edit
watch(markdownText, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    saveDocument();
  }
});
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

    <!-- Added Progress Bar for API Loading -->
    <v-progress-linear
      v-if="apiIsLoading"
      indeterminate
      class="mx-auto mb-4"
    ></v-progress-linear>

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
      <!-- Buttons Container -->
      <div class="flex items-center ml-auto">
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
        <!-- Added Save Button -->
        <v-btn
          icon
          @click="saveDocument"
          :disabled="apiIsLoading"
          title="Save Document"
        >
          <v-icon>mdi-content-save</v-icon>
        </v-btn>
        <!-- Added Load Button -->
        <v-btn
          icon
          @click="loadDocument"
          :disabled="apiIsLoading"
          title="Load Document"
        >
          <v-icon>mdi-content-paste</v-icon>
        </v-btn>
      </div>
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
        <tree
          v-model="notes"
          :data="notes"
          group="notesParent"
          @input="updateData"
        >
        </tree>
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
