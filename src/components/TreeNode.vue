<template>
  <div class="cmp-tree pl-4 border-l-2 border-zinc-600">
    <v-list-item class="group">
      <template v-slot:prepend>
        <v-icon
          @click="open = smAndDown ? open : !open"
          @touchstart="open = !open"
          class="handle"
        >
          {{
            zeroChildren
              ? "mdi-minus"
              : open
              ? "mdi-chevron-up"
              : "mdi-chevron-down"
          }}
        </v-icon>
      </template>
      <div class="flex flex-1">
        <div class="flex-grow flex items-center">
          <v-icon v-if="isUrl" @click="openLink"> mdi-link </v-icon>
          <v-textarea
            v-model="localValue.text"
            rows="1"
            density="compact"
            variant="solo"
            hide-details
            auto-grow
          ></v-textarea>
        </div>
        <div
          class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center invisible group-hover:visible space-x-2 bg-zinc-800 p-2 rounded-lg"
        >
          <v-icon
            @click.stop="smAndDown ? {} : addNode()"
            @touchstart="addNode"
          >
            mdi-plus
          </v-icon>
          <v-icon
            @click.stop="smAndDown ? {} : deleteNode()"
            @touchstart="deleteNode"
            color="red"
          >
            mdi-delete
          </v-icon>
        </div>
      </div>
    </v-list-item>
    <Draggable
      :value="localValue.children"
      v-model="localValue.children"
      ghost-class="ghost"
      @update="updateValue"
      :group="group"
      :item-key="JSON.stringify(localValue)"
      v-bind="dragOptions"
      @start="drag = true"
      @end="drag = false"
      handle=".handle"
    >
      <template #item="{ element }">
        <TreeNode
          v-if="open"
          :value="element"
          @input="updateChildValue"
          :group="group"
          :rowKey="rowKey"
        >
        </TreeNode>
      </template>
    </Draggable>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineEmits, defineProps } from "vue";
import Draggable from "vuedraggable";
import { useDisplay } from "vuetify";
const { smAndDown } = useDisplay();

const props = defineProps({
  value: {
    type: Object,
    default: () => ({
      text: "",
      children: [],
    }),
  },
  root: {
    type: Boolean,
    default: false,
  },
  group: {
    type: String,
    default: null,
  },
  rowKey: {
    type: String,
    default: "text",
  },
});

const emit = defineEmits(["input"]);

const open = ref(false);
const drag = ref(false);
const localValue = ref(props.value);

const zeroChildren = computed(() => {
  return props.value.children.length === 0;
});

const dragOptions = {
  animation: 200,
  group: "description",
  disabled: false,
  ghostClass: "ghost",
};

const isUrl = computed(() => {
  const urlPattern = new RegExp(
    "https?://(?:www\\.)?[a-zA-Z0-9./_-]+(?:\\.[a-zA-Z]{2,})(?:/[a-zA-Z0-9./?=&%_-]*)?"
  );
  return (
    urlPattern.test(localValue.value.text) ||
    (!zeroChildren.value && urlPattern.test(localValue.value.children[0].text))
  );
});

watch(
  () => props.value,
  (newValue) => {
    localValue.value = newValue;
  }
);

function updateValue(value) {
  if (Array.isArray(value)) {
    localValue.value.children = [...value];
    emit("input", localValue.value);
  }
}

function updateChildValue(value) {
  const index = localValue.value.children.findIndex(
    (c) => c[props.rowKey] === value[props.rowKey]
  );
  if (value.delete) {
    localValue.value.children.splice(index, 1);
  } else {
    localValue.value.children.splice(index, 1, value);
  }
  emit("input", localValue.value);
}

function deleteNode() {
  localValue.value.delete = true;
  emit("input", localValue.value);
}

function addNode() {
  localValue.value.children.push({
    text: "",
    children: [],
  });
  open.value = true;
  emit("input", localValue.value);
}

function openLink() {
  const urlPattern = new RegExp(
    "https?://(?:www\\.)?[a-zA-Z0-9./_-]+(?:\\.[a-zA-Z]{2,})(?:/[a-zA-Z0-9./?=&%_-]*)?"
  );
  let match = localValue.value.text.match(urlPattern);
  if (match) {
    window.open(match[0], "_blank");
  } else {
    match = !zeroChildren.value
      ? localValue.value.children[0].text.match(urlPattern)
      : null;
    if (match) {
      window.open(match[0], "_blank");
    } else {
      console.error("No valid URL found in the text.");
    }
  }
}
</script>
