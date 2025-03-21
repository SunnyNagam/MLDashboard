<template>
  <div class="tree-node" :style="{ marginLeft: depth ? '20px' : '0' }">
    <div class="d-flex align-center node-container">
      <v-btn icon size="small" variant="text" :disabled="!hasChildren" @click="hasChildren && toggleExpand()">
        <v-icon>
          {{ hasChildren ? (isExpanded ? "mdi-chevron-down" : "mdi-chevron-right") : "mdi-circle-small" }}
        </v-icon>
      </v-btn>

      <div
        class="node-content pa-2 position-relative"
        @click="hasTagline && toggleTextView()"
        :class="{
          'cursor-pointer': hasTagline,
          'search-highlight': props.searchActive && matchesSearch,
        }"
        v-bind="tooltipText ? { 'v-tooltip': tooltipText, location: 'right' } : {}"
      >
        {{ displayText }}
      </div>
    </div>

    <div v-if="isExpanded && hasChildren" class="tree-children">
      <simple-tree-node
        v-for="(child, index) in node.children"
        :key="index"
        :node="child"
        :depth="depth + 1"
        :expansion-state="expansionState"
        :view-mode="viewMode"
        :show-taglines-only="showTaglinesOnly"
        :search-term="searchTerm"
        :search-active="searchActive"
        @update:node="(updatedChild) => updateChild(index, updatedChild)"
        @register-node="forwardNodeRegistration"
        @has-match="childHasMatch"
      ></simple-tree-node>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
  depth: {
    type: Number,
    default: 0,
  },
  expansionState: {
    type: Object,
    default: () => ({}),
  },
  viewMode: {
    type: String,
    default: "default",
  },
  showTaglinesOnly: {
    type: Boolean,
    default: true,
  },
  searchTerm: {
    type: String,
    default: "",
  },
  searchActive: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:node", "register-node", "has-match"]);

// Basic node properties
const hasChildren = computed(() => props.node.children?.length > 0);
const isPartOfSearchPath = ref(false);

// Extract tagline from text
const taglineData = computed(() => {
  const text = props.node.text || "";
  const taglineMatches = [...text.matchAll(/<([^<>]+)>/g)];

  if (taglineMatches.length > 0) {
    return {
      tagline: taglineMatches[taglineMatches.length - 1][1],
      fullText: text.replace(taglineMatches[taglineMatches.length - 1][0], "").trim(),
      hasTagline: true,
    };
  }

  return {
    tagline: null,
    fullText: text,
    hasTagline: false,
  };
});

const hasTagline = computed(() => taglineData.value.hasTagline);
const showingFullText = ref(false);

// Display text for the node
const displayText = computed(() => {
  if (!hasTagline.value) {
    return props.node.text;
  }

  if (props.showTaglinesOnly && !showingFullText.value) {
    return taglineData.value.tagline;
  } else {
    return taglineData.value.fullText;
  }
});

// Node ID for expansion tracking
const nodeId = computed(() => {
  const textForId = taglineData.value.fullText.substring(0, 20).replace(/\s+/g, "_");
  return `node-${props.depth}-${textForId}`;
});

// User-controlled expansion state
const userControlledExpansion = computed(() => {
  return nodeId.value in props.expansionState ? props.expansionState[nodeId.value] : props.depth < 2;
});

// Combined expansion state for rendering
const isExpanded = computed(() => {
  // During search, expand if this node matches or is part of a match path
  if (props.searchActive) {
    return matchesSearch.value || isPartOfSearchPath.value;
  }

  // Otherwise use user-controlled state
  return userControlledExpansion.value;
});

// Search functions
const textMatchesSearch = (text, term) => {
  if (!text || !term) return false;
  return text.toLowerCase().includes(term.toLowerCase());
};

// Check if this node directly matches the search
const matchesSearch = computed(() => {
  if (!props.searchActive || !props.searchTerm) return false;

  const fullText = taglineData.value.fullText;
  const tagline = taglineData.value.tagline;

  return textMatchesSearch(fullText, props.searchTerm) || textMatchesSearch(tagline, props.searchTerm);
});

// Recursive search through node tree structure
const recursiveSearch = (term) => {
  // Check this node
  if (textMatchesSearch(taglineData.value.fullText, term) || textMatchesSearch(taglineData.value.tagline, term)) {
    return true;
  }

  // If no children, no match
  if (!hasChildren.value) return false;

  // Check all children in data structure (even if not rendered)
  for (const child of props.node.children) {
    // Check direct child
    const childText = child.text || "";
    const childTaglineMatch = childText.match(/<(.*?)>$/);
    const childFullText = childTaglineMatch ? childText.replace(/\s*<.*?>$/, "").trim() : childText;
    const childTagline = childTaglineMatch ? childTaglineMatch[1] : null;

    if (textMatchesSearch(childFullText, term) || textMatchesSearch(childTagline, term)) {
      return true;
    }

    // Check grandchildren (deep search)
    if (child.children && child.children.length) {
      for (const grandchild of child.children) {
        if (deepSearchNode(grandchild, term)) {
          return true;
        }
      }
    }
  }

  return false;
};

// Deep search for matches in node and its children
const deepSearchNode = (node, term) => {
  if (!node) return false;

  // Check node text
  const nodeText = node.text || "";
  const taglineMatch = nodeText.match(/<(.*?)>$/);
  const fullText = taglineMatch ? nodeText.replace(/\s*<.*?>$/, "").trim() : nodeText;
  const tagline = taglineMatch ? taglineMatch[1] : null;

  if (textMatchesSearch(fullText, term) || textMatchesSearch(tagline, term)) {
    return true;
  }

  // Check children recursively
  if (node.children && node.children.length) {
    for (const child of node.children) {
      if (deepSearchNode(child, term)) {
        return true;
      }
    }
  }

  return false;
};

// Event handlers
const childHasMatch = (matches) => {
  if (matches && !isPartOfSearchPath.value) {
    isPartOfSearchPath.value = true;
    emit("has-match", true);
  }
};

const toggleExpand = () => {
  props.expansionState[nodeId.value] = !userControlledExpansion.value;
};

const toggleTextView = () => {
  showingFullText.value = !showingFullText.value;
};

const updateChild = (index, updatedChild) => {
  const newNode = { ...props.node };
  newNode.children[index] = updatedChild;
  emit("update:node", newNode);
};

const forwardNodeRegistration = (nodeData) => {
  emit("register-node", nodeData);
};

// Tooltip for showing percentage information
const tooltipText = computed(() => {
  if (props.node.percentStart !== undefined && props.node.percentEnd !== undefined) {
    const start = Math.round(props.node.percentStart);
    const end = Math.round(props.node.percentEnd);
    return `${start}%-${end}%`;
  }
  return "";
});

// Watchers for search changes
watch(
  () => props.searchTerm,
  (newTerm, oldTerm) => {
    if (newTerm !== oldTerm) {
      // Reset path state when clearing search
      if (!newTerm) {
        isPartOfSearchPath.value = false;
        return;
      }

      // Use recursive search to check this node and all its children
      const hasMatch = recursiveSearch(newTerm);

      // Update state and propagate match upward if found
      if (hasMatch) {
        isPartOfSearchPath.value = true;
        emit("has-match", true);
      } else {
        isPartOfSearchPath.value = false;
      }
    }
  },
  { immediate: true }
);

// Handle search active state changes
watch(
  () => props.searchActive,
  (active) => {
    if (!active) {
      isPartOfSearchPath.value = false;
    } else if (active && props.searchTerm) {
      // When search becomes active, check with current term
      const hasMatch = recursiveSearch(props.searchTerm);
      if (hasMatch) {
        isPartOfSearchPath.value = true;
        emit("has-match", true);
      }
    }
  }
);

// Register with parent when mounted
onMounted(() => {
  emit("register-node", {
    id: nodeId.value,
    depth: props.depth,
    hasChildren: props.node.children?.length > 0,
    content: {
      fullText: taglineData.value.fullText,
      tagline: taglineData.value.tagline,
    },
  });

  // Initial search check if active
  if (props.searchActive && props.searchTerm) {
    const hasMatch = recursiveSearch(props.searchTerm);
    if (hasMatch) {
      isPartOfSearchPath.value = true;
      emit("has-match", true);
    }
  }
});
</script>

<style scoped>
.tree-node {
  margin-bottom: 8px;
}

.node-content {
  flex: 1;
  min-height: 24px;
  border-radius: 4px;
  position: relative;
}

.node-container:hover .node-content::after {
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

.cursor-pointer {
  cursor: pointer;
}

.search-highlight {
  background-color: rgba(255, 213, 79, 0.3);
}
</style>
