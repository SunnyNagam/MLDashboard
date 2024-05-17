<template>
  <div>
    <!-- {{ data }} -->
    <Draggable
      :value="localValue"
      :group="group"
      v-model="treeData"
      class="cmp-tree pt-3"
      :item-key="JSON.stringify(localValue)"
      ghost-class="ghost"
      @update="updateValue"
      v-bind="dragOptions"
      @start="drag = true"
      @end="drag = false"
    >
      <template #item="{ element }">
        <TreeNode
          :value="element"
          :group="group"
          @input="updateItem"
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
import TreeNode from "@/components/TreeNode.vue";

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
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

const drag = ref(false);
const localValue = ref(props.data);

const emit = defineEmits(["input"]);

const treeData = computed({
  get() {
    return localValue.value;
  },
  set(val) {
    emit("input", val); // will update data in parent component, which will trigger the watch and update localValue
    // yea localValue.value = val doesn't work for some reason idk
  },
});

const dragOptions = computed(() => ({
  animation: 200,
  group: "description",
  disabled: false,
  ghostClass: "ghost",
}));

watch(
  () => props.data,
  (newValue) => {
    localValue.value = newValue;
  }
);

function updateValue(value) {
  if (Array.isArray(value)) {
    localValue.value = value;
    emit("input", localValue.value);
  }
}

function updateItem(itemValue) {
  const index = localValue.value.findIndex(
    (v) => v[props.rowKey] === itemValue[props.rowKey]
  );
  if (itemValue.delete) {
    localValue.value.splice(index, 1);
  } else {
    localValue.value.splice(index, 1, itemValue);
  }
  emit("input", localValue.value);
}
</script>
