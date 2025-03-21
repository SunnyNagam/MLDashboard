<template>
  <v-card :class="['mx-auto', isExpanded ? 'h-full d-flex flex-column' : '']" elevation="2" rounded="lg">
    <v-toolbar color="grey-darken-4" dark density="compact">
      <v-btn icon @click="toggleDisplay">
        <v-icon>{{ showContent ? "mdi-chevron-up" : "mdi-chevron-down" }}</v-icon>
      </v-btn>
      <v-toolbar-title>Text to Tree</v-toolbar-title>
      <v-spacer></v-spacer>

      <v-btn icon="mdi-cog" @click="settingsModal = true" />
      <v-btn icon="mdi-delete" @click="clearSummary" />
      <v-btn icon="mdi-arrow-expand" @click="$emit('expand')" />
    </v-toolbar>

    <div :class="['d-flex flex-column', isExpanded ? 'flex-grow-1' : '']">
      <v-card-text v-show="showContent" :class="['overflow-y-auto', isExpanded ? 'flex-grow-1' : '']">
        <!-- Input Area -->
        <v-textarea v-model="transcript" label="Paste transcript here" rows="8" outlined clearable></v-textarea>

        <!-- Transcript cleaning buttons -->
        <div class="d-flex justify-center mb-4">
          <v-btn color="info" :loading="cleaningTranscript" :disabled="!transcript || cleaningTranscript || processing" @click="cleanTranscript">
            Clean Transcript
          </v-btn>
          <v-btn color="error" class="ml-2" :disabled="!originalTranscript" @click="revertTranscript"> Revert </v-btn>
        </div>

        <!-- Existing buttons -->
        <div class="d-flex justify-center mt-4">
          <v-select
            v-model="selectedSummaryMode"
            :items="summaryModes"
            item-title="label"
            item-value="value"
            label="Summary Mode"
            style="max-width: 300px"
            class="mr-2"
          ></v-select>

          <v-btn color="primary" :loading="processing" :disabled="!transcript || processing" @click="processTranscript(selectedSummaryMode)"> Generate </v-btn>

          <v-btn v-if="showTaglineToggle" color="secondary" class="ml-2" :disabled="!treeRoot" @click="toggleTaglinesView">
            {{ showTaglinesOnly ? "Show Full Text" : "Show Taglines" }}
          </v-btn>

          <v-btn v-if="treeRoot" color="secondary" class="ml-2" :loading="isRefining" :disabled="isRefining" @click="refineTree"> Refine </v-btn>

          <!-- Add this button next to the Refine Outputs button -->
          <v-btn v-if="treeRoot" color="secondary" class="ml-2" @click="exportTreeToJson"> Export JSON </v-btn>
        </div>

        <!-- Add a small description of the selected mode -->
        <div v-if="selectedSummaryMode" class="text-caption text-center mt-2">
          {{ getModeDescription(selectedSummaryMode) }}
        </div>

        <!-- Add a custom prompt textarea that appears when custom mode is selected -->
        <div v-if="selectedSummaryMode === 'custom'" class="mt-4 mb-4">
          <v-textarea
            v-model="customPrompt"
            label="Custom Hierarchical Prompt"
            hint="Enter your own prompt for hierarchical summarization. Consider how this prompt will work when applied recursively at each level of the tree."
            rows="4"
            outlined
            persistent-hint
          ></v-textarea>
        </div>

        <!-- Progress indicator - updated to handle cleaning, processing, and refinement -->
        <v-progress-linear v-if="processing || cleaningTranscript || isRefining" :value="progressPercentage" class="mt-4" height="25">
          <template v-slot:default>
            <strong>{{ Math.ceil(progressPercentage) }}% - {{ progressMessage }}</strong>
          </template>
        </v-progress-linear>

        <!-- Add this toolbar above the Results Area -->
        <div v-if="treeRoot" class="tree-controls pa-2 mb-2 d-flex flex-wrap gap-2">
          <v-text-field
            v-model="searchTerm"
            density="compact"
            hide-details
            placeholder="Search tree..."
            prepend-inner-icon="mdi-magnify"
            class="mr-2"
            style="max-width: 250px"
            clearable
            @update:model-value="handleSearch"
          ></v-text-field>
          <v-btn size="small" color="primary" variant="outlined" prepend-icon="mdi-unfold-more-horizontal" @click="expandAllNodes"> Expand All </v-btn>
          <v-btn size="small" color="primary" variant="outlined" prepend-icon="mdi-unfold-less-horizontal" @click="collapseAllNodes"> Collapse All </v-btn>
          <v-btn size="small" color="primary" variant="outlined" prepend-icon="mdi-chevron-down" @click="expandNextLevel"> Expand Next Level </v-btn>
          <v-btn size="small" color="primary" variant="outlined" prepend-icon="mdi-chevron-up" @click="collapseNextLevel"> Collapse Next Level </v-btn>
          <v-btn size="small" color="primary" variant="outlined" prepend-icon="mdi-chevron-triple-down" @click="expandToLevel(2)"> Show 3 Levels </v-btn>

          <v-chip v-if="searchResults.length > 0" class="ml-auto" color="info"> {{ searchResults.length }} matches </v-chip>
        </div>

        <!-- Results Area -->
        <div v-if="treeRoot" class="summary-tree mt-4">
          <simple-tree-node
            :node="treeRoot"
            @update:node="updateTreeRoot"
            @register-node="registerNode"
            :expansion-state="treeExpansionState"
            :show-taglines-only="showTaglinesOnly"
            :search-term="searchTerm"
            :search-active="!!searchTerm"
          ></simple-tree-node>
        </div>
      </v-card-text>
    </div>

    <!-- Settings Modal -->
    <v-dialog v-model="settingsModal" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Summarization Settings</v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-select v-model="selectedModel" :items="modelChoices" dense hide-details bg-color="none"></v-select>
              </v-col>

              <v-col cols="12">
                <v-slider v-model="chunkSize" label="Chunk Size (words per chunk)" min="10" max="100" step="5" thumb-label></v-slider>
              </v-col>

              <v-col cols="12">
                <v-slider v-model="groupSize" label="Group Size (chunks to merge)" min="2" max="10" step="1" thumb-label></v-slider>
              </v-col>

              <v-col cols="12">
                <v-slider v-model="groupOverlap" label="Group Overlap (%)" min="0" max="50" step="10" thumb-label></v-slider>
              </v-col>

              <v-col cols="12">
                <v-checkbox v-model="useOverlap" label="Enable Overlapping Groups"></v-checkbox>
              </v-col>

              <v-col cols="12">
                <v-slider v-model="temperature" label="Temperature" min="0" max="1" step="0.1" thumb-label></v-slider>
              </v-col>

              <v-col cols="12">
                <v-checkbox v-model="includeTaglines" label="Include Taglines"></v-checkbox>
              </v-col>

              <v-col cols="12">
                <v-checkbox v-model="testingMode" label="Testing Mode (No API Calls)"></v-checkbox>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="summarizationPrompt"
                  label="Summarization Prompt"
                  hint="System prompt used for summarization"
                  rows="6"
                  outlined
                  persistent-hint
                ></v-textarea>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="cleaningPrompt"
                  label="Cleaning Prompt"
                  hint="System prompt used for transcript cleaning"
                  rows="4"
                  outlined
                  persistent-hint
                ></v-textarea>
              </v-col>

              <v-col cols="12">
                <v-btn color="secondary" @click="resetPrompts">Reset to Default Prompts</v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="settingsModal = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import OpenAI from "openai";
import { useNotesStore } from "@/stores/useNotesStore";
import SimpleTreeNode from "@/components/SimpleTreeNode.vue"; // Import the component

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

const emit = defineEmits(["expand"]);

const notesStore = useNotesStore();

// UI State
const showContent = ref(!props.collapsed);
const toggleDisplay = () => {
  showContent.value = !showContent.value;
};

// Add transcript cleaning state
const cleaningTranscript = ref(false);
const originalTranscript = ref("");

// Settings modal
const settingsModal = ref(false);
const chunkSize = ref(50); // Words per chunk
const groupSize = ref(3); // Chunks to merge at each level
const groupOverlap = ref(0); // Overlap percentage
const useOverlap = ref(false); // Whether to use overlap
const testingMode = ref(false); // Whether to use testing mode (no API calls)

// Watch for changes to props.collapsed
watch(
  () => props.collapsed,
  (newValue) => {
    showContent.value = !newValue;
  }
);

// Data
const transcript = ref("");
const chunks = ref([]);
const treeNodes = ref([]);
const treeRoot = ref(null);
const processing = ref(false);
const progressPercentage = ref(0);
const progressMessage = ref("");
const apiKey = ref("");
const openaiApi = ref(null);
const counter = ref(0);
const totalCallsNeeded = ref(0);

// Token usage tracking
const totalInputTokens = ref(0);
const totalOutputTokens = ref(0);
const totalCost = ref(0);

// Model selection
const selectedModel = ref("google/gemini-2.0-flash-001");
const modelChoices = [
  "anthropic/claude-3.7-sonnet",
  "ai21/jamba-1.6-mini",
  "nousresearch/hermes-2-pro-llama-3-8b",
  "meta-llama/llama-3.3-70b-instruct",
  "deepseek/deepseek-chat",
  "google/gemini-2.0-flash-lite-001",
  "deepseek/deepseek-r1-distill-llama-8b",
  "qwen/qwen-2.5-coder-32b-instruct",
  "google/gemini-2.0-flash-001",
];

// Add these new variables to the script setup
const showTaglinesOnly = ref(true);
const temperature = ref(0.2);
const includeTaglines = ref(true);
// Default prompt values for reset function
const DEFAULT_SUMMARIZATION_PROMPT =
  "You are a video transcript navigator specializing in hierarchical summarization. Create a clear, concise summary that captures the most important information in one sentence. Focus on actionable insights and key points that would help a viewer decide if this section is relevant to them. Include the main topic, any important facts, and conclusions. End with a brief <tagline in angle brackets> (under 8 words) that someone could use to quickly identify what mainly transpired in this section such as <store had no apples got pear as substitute>. This summary will be used as a navigation point in a video, so it should clearly indicate what a viewer would learn by watching this section. Output only this and nothing else with no filler or intro talk.";
const DEFAULT_CLEANING_PROMPT =
  "You are an expert transcript editor. Your task is to clean up transcripts. Fix grammar, spelling, punctuation, and formatting issues. Do not summarize or change the meaning. Return only the cleaned transcript text without any additional comments.";

const summarizationPrompt = ref(DEFAULT_SUMMARIZATION_PROMPT);
const cleaningPrompt = ref(DEFAULT_CLEANING_PROMPT);

// Add a state variable to track the current mode
const selectedSummaryMode = ref("default");

// Updated prompts for hierarchically effective modes
const SUMMARY_PROMPTS = {
  default:
    "You are a hierarchical summarizer. Create a clear, concise summary that captures the main ideas from the input text. If the input contains multiple summaries, synthesize them into a higher-level summary. Always include a brief <tagline in angle brackets> at the end that captures the essence in under 8 words. Your output will be used for video navigation. Output only this and nothing else with no filler or intro talk.",

  topicMap:
    "You are creating a hierarchical topic map. Extract the main topics and subtopics from the input. If the input already contains topic maps, identify higher-level categories that group these topics together. Format as 'MAIN TOPIC: [topic] • [subtopic 1] • [subtopic 2]'. Ensure each level adds meaningful organization to the hierarchy. Output only this and nothing else with no filler or intro talk.",

  factual:
    "You are building a hierarchy of facts. Extract or synthesize the most important factual statements from the input. If the input already contains facts, prioritize and group related facts into just a few, preserving numerical data and specifics. Your goal is to distill information while maintaining accuracy at each level of the hierarchy. Output only this and nothing else with no filler or intro talk.",

  questions:
    "You are creating a hierarchy of questions. Generate questions that this content answers, or if the input already contains questions, create broader questions that encompass these more specific ones. Work toward fundamental questions at higher levels while maintaining specific inquiries at lower levels. Output only this and nothing else with no filler or intro talk.",

  conceptual:
    "You are mapping conceptual frameworks. Identify key concepts, theories, or mental models in the content. At higher levels, connect related concepts and identify overarching frameworks. Format as 'CONCEPT: [main concept] - [relationship] - [connected concepts]'. Build toward a coherent conceptual understanding. Output only this and nothing else with no filler or intro talk.",

  arguments:
    "You are structuring arguments hierarchically. Identify claims, evidence, and reasoning. At higher levels, connect supporting arguments and identify the main thesis or conclusion. Format as 'CLAIM: [claim] → SUPPORTED BY: [evidence/sub-arguments]'. Build toward the central argument or position. Output only this and nothing else with no filler or intro talk.",

  timeline:
    "You are creating a hierarchical timeline. Extract events in chronological order. At higher levels, combine into a single sequence sumarizing the previous levels, identifying major transitions. Format your answer as a single 3 step sequence (First: <text> → Then: <text> → Next: <text>). Focus on the progression and causal relationships between events. Output only this and nothing else with no filler or intro talk.",

  keypoints:
    "You are extracting hierarchical key points. Identify the most important information at each level. At higher levels, prioritize by significance and consolidate related points. Number your points (1., 2., etc.). Your goal is to create a multi-level overview of essential information, with the most critical points rising to the top. Output only this and nothing else with no filler or intro talk.",
};

// Updated dropdown options
const summaryModes = [
  { label: "Standard Summary", value: "default" },
  { label: "Topic Hierarchy", value: "topicMap" },
  { label: "Fact Hierarchy", value: "factual" },
  { label: "Question Hierarchy", value: "questions" },
  { label: "Conceptual Framework", value: "conceptual" },
  { label: "Argument Structure", value: "arguments" },
  { label: "Timeline Evolution", value: "timeline" },
  { label: "Key Points Hierarchy", value: "keypoints" },
  { label: "Custom Prompt", value: "custom" },
];

// Updated descriptions
const getModeDescription = (mode) => {
  if (mode === "custom") {
    return "User-defined hierarchical summarization prompt";
  }

  const descriptions = {
    default: "Builds a tree of summaries with increasingly broader abstraction at each level",
    topicMap: "Creates a hierarchical organization of topics and subtopics from specific to general",
    factual: "Extracts and organizes factual information, preserving important statistics and data",
    questions: "Generates a hierarchy from specific questions to broader lines of inquiry",
    conceptual: "Maps concepts and their relationships, building toward an abstract conceptual model",
    arguments: "Structures arguments from evidence to claims to overall thesis or position",
    timeline: "Organizes events chronologically, grouping into phases and identifying key transitions",
    keypoints: "Extracts the most important points at each level, prioritized by significance",
  };

  return descriptions[mode] + (mode !== "custom" ? "\n(" + SUMMARY_PROMPTS[mode] + ")" : "");
};

// Initialize OpenRouter API
const fetchOpenRouterApiKey = async () => {
  try {
    const openRouterKey = await notesStore.findApiKey("OpenRouter");
    if (openRouterKey) {
      apiKey.value = openRouterKey;
      openaiApi.value = new OpenAI({
        apiKey: apiKey.value,
        baseURL: "https://openrouter.ai/api/v1",
        dangerouslyAllowBrowser: true,
      });
    } else {
      console.error("OpenRouter API key not found in notes.");
    }
  } catch (error) {
    console.error("Error fetching OpenRouter API key:", error);
  }
};

// Call fetchOpenRouterApiKey on component mount
fetchOpenRouterApiKey();

// Function to chunk the transcript into sentences with overlap
const chunkTranscript = () => {
  const words = transcript.value.split(/\s+/);
  const result = [];

  // Skip empty transcript
  if (words.length === 0) return result;

  // Calculate overlap amount in words
  const overlapAmount = Math.floor(chunkSize.value * (groupOverlap.value / 100));

  // Create chunks with overlap
  for (let i = 0; i < words.length; i += chunkSize.value) {
    // Calculate start and end positions with overlap
    const startPos = Math.max(0, i - overlapAmount);
    const endPos = Math.min(words.length, i + chunkSize.value + overlapAmount);

    // Create chunk with overlap
    const chunk = words.slice(startPos, endPos).join(" ");

    if (chunk.trim()) {
      result.push(chunk);
    }
  }

  return result;
};

// Function to generate a summary of two chunks
const generateSummary = async (texts) => {
  if (!openaiApi.value && !testingMode.value) {
    console.error("OpenAI API is not initialized.");
    return "Error: API not initialized";
  }

  const combinedText = texts.map((text) => `"${text}"`).join("\n\n");

  try {
    let response;

    if (!testingMode.value) {
      // Get the appropriate prompt based on the summary mode
      let finalPrompt;

      if (selectedSummaryMode.value === "custom") {
        finalPrompt = customPrompt.value;
      } else {
        finalPrompt = SUMMARY_PROMPTS[selectedSummaryMode.value] || summarizationPrompt.value;
      }

      // Handle tagline instructions based on includeTaglines setting
      if (includeTaglines.value) {
        // Add tagline instructions if they don't already exist in the prompt
        if (!finalPrompt.includes("<tagline") && !finalPrompt.includes("angle brackets")) {
          finalPrompt += " End with a brief <summary in angle brackets> (under 8 words) that captures the essence of this section.";
        }
      } else {
        // Remove tagline instructions if they exist
        finalPrompt = finalPrompt
          .replace(/\s*End with a brief.*?<.*?>.*?\.?/, "")
          .replace(/\s*Always include a brief.*?<.*?>.*?\.?/, "")
          .replace(/\s*Add a.*?<.*?>.*?\.?/, "");
      }

      response = await openaiApi.value.chat.completions.create({
        model: selectedModel.value,
        temperature: temperature.value,
        messages: [
          {
            role: "system",
            content: finalPrompt,
          },
          {
            role: "user",
            content: combinedText, // Simplified user prompt without duplicate instructions
          },
        ],
      });

      // Track token usage
      if (response.usage) {
        const { prompt_tokens, completion_tokens } = response.usage;
        totalInputTokens.value += prompt_tokens || 0;
        totalOutputTokens.value += completion_tokens || 0;
      }
    } else {
      // Use mode-specific test data for testing mode
      let testContent;
      // Use a random text from the input for default testing mode
      const randomIndex = Math.floor(Math.random() * texts.length);
      testContent = texts[randomIndex] || "No text available";

      totalInputTokens.value += combinedText.length + 40;
      totalOutputTokens.value += testContent.length;

      response = {
        choices: [
          {
            message: { content: testContent },
          },
        ],
      };
    }

    counter.value++;
    progressPercentage.value = (counter.value / totalCallsNeeded.value) * 100;
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Summary generation error:", error);
    return "Error generating summary";
  }
};

// Process the transcript to build the binary tree
const processTranscript = async (mode = "default") => {
  if (!transcript.value) return;

  // Initialize processing state
  selectedSummaryMode.value = mode;
  initializeProcessingState(mode);

  // Create the initial leaf nodes
  createInitialLeafNodes();

  // Calculate total calls needed for UI progress tracking
  calculateTotalApiCalls();

  // Build the tree bottom-up through recursive summarization
  await buildTreeHierarchy();

  // Finalize processing and cleanup
  finalizeTreeProcessing();
};

// Helper functions for processTranscript

const initializeProcessingState = (mode) => {
  processing.value = true;
  progressPercentage.value = 0;
  progressMessage.value = `Splitting transcript into chunks for ${mode} summary...`;
  counter.value = 0;
  totalInputTokens.value = 0;
  totalOutputTokens.value = 0;
  totalCost.value = 0;
};

const createInitialLeafNodes = () => {
  // 1. Split transcript into chunks
  chunks.value = chunkTranscript();

  // 2. Create leaf nodes with percentage information
  const totalChunks = chunks.value.length;
  treeNodes.value = chunks.value.map((chunk, index) => ({
    text: chunk,
    children: [],
    percentStart: (index / totalChunks) * 100,
    percentEnd: ((index + 1) / totalChunks) * 100,
  }));

  progressPercentage.value = 10;
  progressMessage.value = "Created leaf nodes, starting summarization...";
};

const calculateTotalApiCalls = () => {
  let levelNodes = [...treeNodes.value];
  totalCallsNeeded.value = 0;
  const currentGroupSize = groupSize.value;

  // Count calls needed for each level until we reach the root
  while (levelNodes.length > 1) {
    totalCallsNeeded.value += Math.ceil(levelNodes.length / currentGroupSize);
    levelNodes = Array(Math.ceil(levelNodes.length / currentGroupSize)).fill(null);
  }
};

const createNodeGroups = (nodes, groupSize) => {
  // Handle overlapping groups if enabled
  if (useOverlap.value && groupOverlap.value > 0) {
    return createOverlappingGroups(nodes, groupSize);
  } else {
    // Simple non-overlapping groups
    const groups = [];
    for (let i = 0; i < nodes.length; i += groupSize) {
      groups.push(nodes.slice(i, i + groupSize));
    }
    return groups;
  }
};

const createOverlappingGroups = (nodes, groupSize) => {
  const groups = [];
  let step = Math.floor(groupSize * (1 - groupOverlap.value / 100));
  step = Math.max(1, step); // Ensure step is at least 1

  for (let i = 0; i < nodes.length; i += step) {
    const endIdx = Math.min(i + groupSize, nodes.length);
    groups.push(nodes.slice(i, endIdx));
    if (endIdx === nodes.length) break;
  }

  return groups;
};

const processNodeBatch = async (groups, batchStartIndex, batchSize) => {
  const batchPromises = [];
  const batchEnd = Math.min(batchStartIndex + batchSize, groups.length);

  // Create promises for each group in this batch
  for (let j = batchStartIndex; j < batchEnd; j++) {
    const group = groups[j];
    const groupTexts = group.map((node) => node.text);

    batchPromises.push(
      generateSummary(groupTexts).then((summary) => ({
        text: summary,
        children: group,
        percentStart: group[0].percentStart,
        percentEnd: group[group.length - 1].percentEnd,
      }))
    );
  }

  // Process all promises in parallel and return results
  return await Promise.all(batchPromises);
};

const buildTreeHierarchy = async () => {
  let currentLevel = [...treeNodes.value];
  let levelIndex = 0;
  const currentGroupSize = groupSize.value;
  const BATCH_SIZE = 25;

  // Build tree bottom-up until we have a single root node
  while (currentLevel.length > 1) {
    progressMessage.value = `Processing level ${levelIndex + 1}, ${counter.value} nodes out of ${totalCallsNeeded.value}`;
    const nextLevel = [];

    // Create groups of nodes to summarize together
    const groups = createNodeGroups(currentLevel, currentGroupSize);

    // Process groups in parallel batches to avoid overwhelming API
    for (let i = 0; i < groups.length; i += BATCH_SIZE) {
      const batchResults = await processNodeBatch(groups, i, BATCH_SIZE);
      nextLevel.push(...batchResults);

      // Update progress after each batch
      progressPercentage.value = (counter.value / totalCallsNeeded.value) * 100;
    }

    // Move up to next level
    currentLevel = nextLevel;
    levelIndex++;
  }

  // Set the final root node (should be only one node at this point)
  treeRoot.value = currentLevel[0];
};

const finalizeTreeProcessing = () => {
  // Update UI state
  progressPercentage.value = 100;
  progressMessage.value = "Summary tree generation complete!";
  processing.value = false;

  // Initialize expansion state for the tree
  initializeExpansionState();

  // Reset node registration for next use
  treeNodesByDepth.value = {};
};

// Make sure to also define a function to clear search when needed
const clearSearch = () => {
  searchTerm.value = "";
  searchResults.value = [];
};

// Add this function
const initializeExpansionState = () => {
  if (!treeRoot.value) return;

  // Clear previous state
  treeExpansionState.value = {};
  // Force reactivity
  treeExpansionState.value = { ...treeExpansionState.value };
};

// Clear the summary and reset the component
const clearSummary = () => {
  transcript.value = "";
  treeRoot.value = null;
  counter.value = 0;
  totalCallsNeeded.value = 0;
  totalInputTokens.value = 0;
  totalOutputTokens.value = 0;
  totalCost.value = 0;
  clearSearch();
  treeNodesByDepth.value = {};
  allTreeNodes.value = {};
};

// Function to update the tree root when modified via UI
const updateTreeRoot = (value) => {
  treeRoot.value = value;
};

// Function to toggle between full summaries and taglines only
const toggleTaglinesView = () => {
  showTaglinesOnly.value = !showTaglinesOnly.value;
};

// Clean up transcript with the LLM
const cleanTranscript = async () => {
  if (!transcript.value || cleaningTranscript.value) return;

  // Store original transcript in case user wants to revert
  originalTranscript.value = transcript.value;
  cleaningTranscript.value = true;
  progressMessage.value = "Cleaning transcript...";
  progressPercentage.value = 0;

  try {
    if (!openaiApi.value && !testingMode.value) {
      console.error("OpenAI API is not initialized.");
      cleaningTranscript.value = false;
      return;
    }

    if (!testingMode.value) {
      const response = await openaiApi.value.chat.completions.create({
        model: "google/gemini-2.0-flash-001",
        temperature: temperature.value,
        messages: [
          {
            role: "system",
            content: cleaningPrompt.value,
          },
          {
            role: "user",
            content: `Please clean up this YouTube video transcript, fixing any grammar issues, typos, and improving structure while preserving all content and meaning:\n\n${transcript.value}`,
          },
        ],
      });

      // Track token usage
      if (response.usage) {
        const { prompt_tokens, completion_tokens } = response.usage;
        totalInputTokens.value += prompt_tokens || 0;
        totalOutputTokens.value += completion_tokens || 0;
      }

      transcript.value = response.choices[0].message.content.trim();
    } else {
      // In testing mode, just wait and return the same transcript
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    progressMessage.value = "Transcript cleaned successfully!";
    progressPercentage.value = 100;

    // Reset progress after a moment
    setTimeout(() => {
      progressMessage.value = "";
      progressPercentage.value = 0;
    }, 2000);
  } catch (error) {
    console.error("Transcript cleaning error:", error);
    progressMessage.value = "Error cleaning transcript";
  } finally {
    cleaningTranscript.value = false;
  }
};

// Function to revert to original transcript
const revertTranscript = () => {
  if (originalTranscript.value) {
    transcript.value = originalTranscript.value;
    originalTranscript.value = "";
  }
};

// Function to reset prompts to default values
const resetPrompts = () => {
  summarizationPrompt.value = DEFAULT_SUMMARIZATION_PROMPT;
  cleaningPrompt.value = DEFAULT_CLEANING_PROMPT;
};

// Update the showTaglineToggle function
const showTaglineToggle = computed(() => {
  return includeTaglines.value;
});

// Add a state variable for the custom prompt
const customPrompt = ref(
  "You are a hierarchical summarizer. Create a summary of the content that captures key information. When summarizing summaries at higher levels, maintain the hierarchical structure while providing increasingly abstract overviews. Your output should be concise and focus on the most important elements."
);

const isRefining = ref(false);

const refineTree = async () => {
  if (!treeRoot.value) return;

  isRefining.value = true;
  progressPercentage.value = 0;
  progressMessage.value = "Refining tree structure...";

  // Current mode for refinement
  const currentMode = selectedSummaryMode.value;

  try {
    // Traverse tree and collect all nodes with context
    const allNodes = collectNodesWithContext(treeRoot.value);

    // Create a flattened sequence based on content percentages
    // This helps identify sequential neighbors even across different branches
    allNodes.sort((a, b) => {
      // If percentStart is available, use it for ordering
      if (a.node.percentStart !== undefined && b.node.percentStart !== undefined) {
        return a.node.percentStart - b.node.percentStart;
      }
      // Fallback to path-based ordering
      return a.path.join(".").localeCompare(b.path.join("."));
    });

    // Add sequential neighbor information
    for (let i = 0; i < allNodes.length; i++) {
      // Left neighbor (previous in sequence)
      if (i > 0) {
        allNodes[i].context.leftNeighbor = allNodes[i - 1].node.text;
      }

      // Right neighbor (next in sequence)
      if (i < allNodes.length - 1) {
        allNodes[i].context.rightNeighbor = allNodes[i + 1].node.text;
      }
    }

    totalCallsNeeded.value = allNodes.length;
    counter.value = 0;

    // Process nodes in batches
    const BATCH_SIZE = 25;
    for (let i = 0; i < allNodes.length; i += BATCH_SIZE) {
      progressMessage.value = `Refining ${currentMode} nodes ${i + 1}-${Math.min(i + BATCH_SIZE, allNodes.length)} of ${allNodes.length}...`;
      const batch = allNodes.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async ({ node, context, path }) => {
          const refinedText = await refineNode(node.text, context, currentMode);

          // Only update if text actually changed
          if (refinedText !== node.text) {
            // Update node text
            node.text = refinedText;

            // Update UI progress
            counter.value++;
            progressPercentage.value = (counter.value / totalCallsNeeded.value) * 100;
          }
        })
      );
    }

    // Force UI update by creating a new reference
    treeRoot.value = { ...treeRoot.value };
    progressMessage.value = `${currentMode} refinement complete!`;
    progressPercentage.value = 100;
  } catch (error) {
    console.error("Error during refinement:", error);
    progressMessage.value = "Error during refinement";
  } finally {
    isRefining.value = false;
  }
};

const collectNodesWithContext = (node, parent = null, siblings = [], path = [], acc = [], grandParent = null) => {
  if (!node.children?.length) return acc;

  // Get siblings (all children of parent except this node)
  const siblingNodes = parent?.children?.filter((child) => child !== node) || [];

  // Get uncles/aunts (all children of grandparent except parent)
  const uncleAuntNodes = grandParent?.children?.filter((child) => child !== parent) || [];

  // Collect context from parent, siblings, uncles/aunts, and children
  const context = {
    parent: parent?.text,
    siblings: siblingNodes.map((s) => s.text),
    unclesAunts: uncleAuntNodes.map((u) => u.text),
    children: node.children?.map((c) => c.text) || [],
    depth: path.length,
    position: path.join(".") || "root",
    percentRange: node.percentStart !== undefined ? `${Math.round(node.percentStart)}%-${Math.round(node.percentEnd)}%` : undefined,
    // These will be filled in later after we have the full flattened sequence
    leftNeighbor: null,
    rightNeighbor: null,
  };

  acc.push({ node, context, path });

  // Process children with this node as parent and current parent as grandparent
  node.children.forEach((child, idx) => {
    const childPath = [...path, idx];
    collectNodesWithContext(
      child,
      node,
      node.children.filter((c) => c !== child),
      childPath,
      acc,
      parent // pass current parent as grandParent for child nodes
    );
  });

  return acc;
};

const refineNode = async (currentText, context, mode = selectedSummaryMode.value) => {
  if (!openaiApi.value && !testingMode.value) return currentText;

  // Extract tagline if present to ensure we preserve it
  const taglineMatches = [...currentText.matchAll(/<([^<>]+)>/g)];
  const tagline = taglineMatches.length > 0 ? taglineMatches[taglineMatches.length - 1][1] : "";
  const textWithoutTagline = tagline ? currentText.replace(/\s*<.*?>$/, "").trim() : currentText;

  // Get the original prompt for this mode
  const originalPrompt = mode === "custom" ? customPrompt.value : SUMMARY_PROMPTS[mode] || summarizationPrompt.value;

  // Extract format guidance (look for "Format as" or similar instructions)
  const formatGuidance = extractFormatGuidance(originalPrompt);

  // Create a more concise context representation
  const conciseContext = {
    parent: truncateText(context.parent, 120),
    siblings: context.siblings.map((s) => extractCore(s)),
    children: context.children.map((c) => extractCore(c)),
    leftNeighbor: context.leftNeighbor ? extractCore(context.leftNeighbor) : null,
    rightNeighbor: context.rightNeighbor ? extractCore(context.rightNeighbor) : null,
  };

  const refinementPrompt = `Refine this current node in a ${mode} tree structure using the provided surrounding context. 

Original mode instructions: "${originalPrompt}"

CURRENT NODE: "${textWithoutTagline}"
${tagline ? `CURRENT TAGLINE: ${tagline}` : ""}
POSITION: Level ${context.depth} in tree ${context.position ? `(position ${context.position})` : ""}
${context.percentRange ? `CONTENT RANGE: ${context.percentRange} of source material` : ""}

ESSENTIAL CONTEXT:
${conciseContext.parent ? `- PARENT NODE: "${conciseContext.parent}"` : "- ROOT NODE"}
${conciseContext.children.length > 0 ? `- CHILD NODES: ${conciseContext.children.map((c) => `• "${c}"`).join(", ")}` : "- NO CHILDREN (leaf node)"}
${conciseContext.siblings.length > 0 ? `- SIBLING NODES: ${conciseContext.siblings.map((s) => `• "${s}"`).join(", ")}` : "- NO SIBLINGS"}
${conciseContext.leftNeighbor ? `- SEQUENTIAL PREDECESSOR: "${conciseContext.leftNeighbor}"` : ""}
${conciseContext.rightNeighbor ? `- SEQUENTIAL SUCCESSOR: "${conciseContext.rightNeighbor}"` : ""}

REFINEMENT INSTRUCTIONS:
1. Preserve the core meaning of the node
2. Ensure it properly represents its children's content
3. Make it distinct from but complementary to siblings
4. Consider the natural flow from previous to next sequential content
5. ${tagline ? `Keep a concise short summary in <angle brackets> at the end` : "Add a brief <summary in angle brackets> at the end"}
6. Keep your response concise and focused and don't add any unneeded explanation or commentary

REFINED NODE:`;

  try {
    if (!testingMode.value) {
      const response = await openaiApi.value.chat.completions.create({
        model: selectedModel.value,
        temperature: Math.max(0.1, temperature.value - 0.1), // Slightly lower temperature for refinement
        messages: [
          {
            role: "system",
            content: `You are an expert at refining hierarchical content in ${mode} format. Your goal is to improve clarity, coherence, and structural relationships while preserving meaning.`,
          },
          { role: "user", content: refinementPrompt },
        ],
      });

      // Track token usage
      if (response.usage) {
        const { prompt_tokens, completion_tokens } = response.usage;
        totalInputTokens.value += prompt_tokens || 0;
        totalOutputTokens.value += completion_tokens || 0;
      }

      return response.choices[0].message.content.trim();
    }

    // Testing mode
    return tagline ? `[Refined] ${textWithoutTagline} ${tagline}` : `[Refined] ${currentText} <improved>`;
  } catch (error) {
    console.error("Refinement error:", error);
    return currentText; // Return original on error
  }
};

// Helper functions to reduce context bloat
const truncateText = (text, maxLength) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const extractCore = (text) => {
  if (!text) return "";

  // Find all taglines (anything in angle brackets) and take the last one
  const taglineMatches = [...text.matchAll(/<([^<>]+)>/g)];
  const tagline = taglineMatches.length > 0 ? taglineMatches[taglineMatches.length - 1][1] : "";

  // Get the first sentence or a portion of the text
  let core = text.split(/\.|\!|\?/)[0];

  // Truncate if still too long
  core = truncateText(core, 300);

  // Add tagline if available and core is not the tagline itself
  if (tagline && !core.includes(tagline)) {
    return `${core} <${tagline}>`;
  }

  return core;
};

const extractFormatGuidance = (prompt) => {
  // Look for format instructions in the prompt
  const formatPatterns = [/format as [^\.]+/i, /format your answer as [^\.]+/i, /output should be formatted as [^\.]+/i, /numbered points/i, /format: [^\.]+/i];

  for (const pattern of formatPatterns) {
    const match = prompt.match(pattern);
    if (match) return match[0];
  }

  return "";
};

// Add this function to export the tree as JSON
const exportTreeToJson = () => {
  if (!treeRoot.value) return;

  // Create a cleaned version of the tree (without circular refs)
  const cleanTree = cleanTreeForExport(treeRoot.value);

  // Convert to pretty-printed JSON string
  const jsonString = JSON.stringify(cleanTree, null, 2);

  // Create a blob and trigger download
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  // Create temporary link and trigger download
  const a = document.createElement("a");
  a.href = url;
  a.download = `transcript-tree-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();

  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};

// Helper function to clean tree for export
const cleanTreeForExport = (node) => {
  if (!node) return null;

  // Find all taglines (anything in angle brackets) and take the last one
  const taglineMatches = [...node.text.matchAll(/<([^<>]+)>/g)];

  const cleanNode = {};

  // Add tagline info if present
  if (taglineMatches.length > 0) {
    const lastMatch = taglineMatches[taglineMatches.length - 1];
    cleanNode.tagline = lastMatch[1];

    // Remove the last tagline from the text
    const lastTaglinePos = lastMatch.index;
    const lastTaglineText = lastMatch[0];
    const textBeforeLastTagline = node.text.substring(0, lastTaglinePos);
    const textAfterLastTagline = node.text.substring(lastTaglinePos + lastTaglineText.length);

    cleanNode.text = (textBeforeLastTagline + textAfterLastTagline).trim();
  } else {
    cleanNode.text = node.text;
  }

  // Process children recursively
  if (node.children && node.children.length) {
    cleanNode.children = node.children.map(cleanTreeForExport);
  }

  return cleanNode;
};

// Add these variables to track expansion state
const treeExpansionState = ref({});

// Functions to control tree expansion
const expandAllNodes = () => {
  treeExpansionState.value = Object.keys(treeExpansionState.value).reduce((acc, key) => {
    acc[key] = true;
    return acc;
  }, {});
};

const collapseAllNodes = () => {
  treeExpansionState.value = Object.keys(treeExpansionState.value).reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {});
};

const expandNextLevel = () => {
  // Find the maximum currently expanded level
  const maxExpandedLevel = findMaxExpandedLevel();

  // Expand one more level
  const targetLevel = maxExpandedLevel + 1;

  // Make sure we have nodes at this level before trying to expand
  if (treeNodesByDepth.value[targetLevel]) {
    expandToLevel(targetLevel + 1); // +1 because expandToLevel is "less than level"
  }
};

const collapseNextLevel = () => {
  // Find the maximum currently expanded level
  const maxExpandedLevel = findMaxExpandedLevel();
  console.log("Max expanded level:", maxExpandedLevel);

  // Don't collapse below level 0
  if (maxExpandedLevel >= 0) {
    expandToLevel(maxExpandedLevel - 1); // This will keep levels < maxExpandedLevel expanded
  }
};

const findMaxExpandedLevel = () => {
  if (!treeRoot.value || Object.keys(treeNodesByDepth.value).length === 0) return 0;

  // Get sorted depths
  const depths = Object.keys(treeNodesByDepth.value)
    .map(Number)
    .sort((a, b) => a - b);

  // Find the first level where at least one node is not expanded
  for (const level of depths) {
    const nodeIds = treeNodesByDepth.value[level];

    // Skip empty levels
    if (!nodeIds || nodeIds.length === 0) continue;

    // Check if all nodes at this level are expanded
    const allExpanded = nodeIds.every((id) => treeExpansionState.value[id] === true);

    // If not all nodes are expanded at this level, return the previous level
    if (!allExpanded) {
      return level - 1;
    }
  }

  // If all levels are expanded, return the last level
  return depths.length > 0 ? depths[depths.length - 1] : 0;
};

const treeNodesByDepth = ref({});
// Add a function to register nodes from children
const registerNode = ({ id, depth, hasChildren, content }) => {
  // Register node in depth index
  if (!treeNodesByDepth.value[depth]) {
    treeNodesByDepth.value[depth] = [];
  }

  // Only add id if it doesn't already exist
  if (!treeNodesByDepth.value[depth].includes(id)) {
    treeNodesByDepth.value[depth].push(id);
  }

  // Set initial expansion state if not already set
  if (!(id in treeExpansionState.value)) {
    treeExpansionState.value[id] = depth < 2;
  }

  // Store node content for search with proper validation
  if (content) {
    allTreeNodes.value[id] = content;
  }
};

// Then use this to expand to a specific level
const expandToLevel = (level) => {
  Object.entries(treeNodesByDepth.value).forEach(([depth, nodeIds]) => {
    const shouldExpand = Number(depth) <= level;
    nodeIds.forEach((id) => {
      treeExpansionState.value[id] = shouldExpand;
    });
  });

  // Force reactivity
  treeExpansionState.value = { ...treeExpansionState.value };
};

const searchTerm = ref("");
const searchResults = ref([]);
const allTreeNodes = ref({});

const handleSearch = (term) => {
  // Reset search results when term is empty
  if (!term || !treeRoot.value) {
    searchResults.value = [];
    return;
  }

  // Convert to lowercase for case-insensitive search
  const searchLower = term.toLowerCase();

  // Find matching nodes
  searchResults.value = Object.entries(allTreeNodes.value)
    .filter(([_, nodeData]) => {
      return (
        nodeData &&
        ((nodeData.fullText && nodeData.fullText.toLowerCase().includes(searchLower)) ||
          (nodeData.tagline && nodeData.tagline.toLowerCase().includes(searchLower)))
      );
    })
    .map(([nodeId]) => nodeId);
};

// Add this listener for the root component
const handleRootMatchFound = (hasMatch) => {
  if (hasMatch) {
    console.log("Found matches in tree");
  }
};
</script>
<style scoped>
.summary-tree {
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
}

.tree-node {
  margin-bottom: 8px;
}

.preview-btn {
  opacity: 0.6;
  transition: opacity 0.2s;
}

.node-container:hover .preview-btn {
  opacity: 1;
}

.tree-children {
  padding-left: 10px;
  margin-top: 4px;
  border-left: 1px dashed rgba(0, 0, 0, 0.2);
}

.node-content::after {
  content: "";
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.1);
  opacity: 0;
  transition: opacity 0.2s;
}

.node-container:hover .node-content::after {
  opacity: 1;
}
</style>
